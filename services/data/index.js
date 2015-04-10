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

  if (cache.get(params.resource)) {
    return callback(null, cache.get(params.resource));
  }

  fetchLib.fetchOne(params, callback);
}

module.exports = {
  fetch: fetch
};