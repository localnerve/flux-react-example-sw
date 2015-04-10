/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var request = require('superagent');
var debug = require('debug')('Example:Data:Fetch');

var cache = require('./cache');
var config = require('../../configs').create().get('data');

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
    callback(new Error('Content not found for '+params.url));    
  });
}

/**
 * Get all resources from FRED and cache them.
 * TODO: call from worker in one-off dyno.
 */
function fetchAll () {
  fetchOne({ resource: 'routes' }, function(err, routes) {
    if (err) {
      return debug('fetchAll failed to get routes: '+err);
    }
    Object.keys(routes).forEach(function(route) {
      fetchOne(route.action.params, function(err, resource) {
        if (err) {
          return debug('fetchAll failed to get '+route.action.params.resource);
        }
        debug('fetchAll successfully fetched '+route.action.params.resource);
      });
    });
  });
}

module.exports = {
  fetchOne: fetchOne,
  fetchAll: fetchAll
};