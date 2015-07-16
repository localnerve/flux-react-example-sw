/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var request = require('superagent');
var Q = require('q');
var debug = require('debug')('Example:Data:Fetch');

var cache = require('./cache');
var config = require('../../configs').create().data;

/**
 * Get a single resource from FRED and cache it.
 */
function fetchOne (params, callback) {
  debug('fetching resource "'+params.resource+'"');

  // A manifest request has no url specified
  if (!params.url) {
    params.url = config.FRED.url();
  } else {
    params.url = config.FRED.branchify(params.url);
  }

  request.get(params.url)
  .set('User-Agent', 'superagent')
  .set('Accept', config.FRED.mediaType())
  .end(function(err, res) {
    if (err) {
      debug('GET failed for ' + params.url + ': ' + err);
      return callback(err);
    }

    var content = res.body && res.body.content;

    if (content) {
      debug('Content successfully retrieved for', params.url);
      cache.put(params, new Buffer(content, 'base64').toString());
      return callback(null, cache.get(params.resource));
    }

    debug('Content not found for', params.url, res.body);
    return callback(new Error('Content not found for '+params.url));
  });
}

/**
 * Get the main resource from FRED.
 * Populates/updates the routes and models (all top-level resources).
 */
function fetchMain (callback) {
  fetchOne({
    resource: config.FRED.mainResource
  }, callback);
}

/**
 * Get all resources from FRED and cache them.
 * Call to update or populate the entire data cache.
 * Returns an array of each routes' content.
 */
function fetchAll (callback) {
  fetchMain(function (err, routes) {
    if (err) {
      debug('fetchAll failed to get routes: '+err);
      return callback(err);
    }

    Q.all(
      Object.keys(routes).map(function (route) {
        return Q.nfcall(fetchOne, routes[route].action.params);
      })
    )
    .then(function (result) {
      callback(null, result);
    }, callback);
  });
}

module.exports = {
  fetchMain: fetchMain,
  fetchOne: fetchOne,
  fetchAll: fetchAll
};
