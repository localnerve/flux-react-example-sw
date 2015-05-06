/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Example:Data');
var cache = require('./cache');
var fetchLib = require('./fetch');

/**
 * Get a resource from cache.
 * If not found, get a resource from FRED
 */
function fetch (params, callback) {
  debug('fetching resource "'+params.resource+'"');

  var resource = cache.get(params.resource);

  if (resource) {
    debug('cache hit');
    return callback(null, resource);
  }

  fetchLib.fetchOne(params, callback);
}

/**
 * Initialize the data layer
 */
function initialize (callback) {
  debug('initializing');

  fetchLib.fetchMain(callback);
}

module.exports = {
  fetch: fetch,
  initialize: initialize
};
