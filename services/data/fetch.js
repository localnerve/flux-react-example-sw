/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global Promise */
'use strict';

var request = require('superagent');
var debug = require('debug')('Example:Data:Fetch');

var cache = require('./cache');
var config = require('../../configs').create().data;

/**
 * Get a single resource from FRED and cache it.
 *
 * @param {Object} params - The parameters controlling fetch.
 * @param {String} params.resource - The name of the resource to fetch, the key for the fetched data.
 * @param {String} [params.url] - The url of the resource to fetch. If omitted, defaults to the FRED url.
 * @param {Function} callback - The callback to execute on completion.
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
      cache.put(params, new Buffer(content, config.FRED.contentEncoding()).toString());
      return callback(null, cache.get(params.resource));
    }

    debug('Content not found for', params.url, res.body);
    return callback(new Error('Content not found for '+params.url));
  });
}

/**
 * Get the main resource from FRED.
 * Populates/updates the routes and models (all top-level resources).
 *
 * @param {Function} callback - The callback to execute on completion.
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
 *
 * @param {Function} callback - The callback to execute on completion.
 */
function fetchAll (callback) {
  fetchMain(function (err, routes) {
    if (err) {
      debug('fetchAll failed to get routes: '+err);
      return callback(err);
    }

    Promise.all(
      Object.keys(routes).map(function (route) {
        return new Promise(function (resolve, reject) {
          fetchOne(routes[route].action.params, function (err, res) {
            if (err) {
              return reject(err);
            }
            return resolve(res);
          });
        });
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
