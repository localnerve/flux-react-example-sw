/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * A simple mock for service worker CacheStorage API.
 */
/* global Promise */
'use strict';

var Response = require('./response');

function Cache (options) {
  this.options = options || {};
}
Cache.prototype = {
  match: function match (req) {
    var response, found = this.options.found;

    if (found) {
      response = found[req];
    } else {
      if (this.options.default) {
        response = new Response({
          test: 'hello'
        }, {
          status: 200
        });
      }
    }

    return Promise.resolve(response);
  }
};

/**
 * A limited, simple mock of CacheStorage.
 *
 * @param {Object} [options] - behavioral options
 * If not supplied a default behavior is supplied.
 * @param {Object} [options.cacheNames] - A map of supported cacheNames.
 * If not supplied, all are supported.
 * @param {Object} [options.cache] - Cache behavior options.
 * If not supplied, the default behavior is supplied.
 * @param {Object} [options.cache.found] - A map of requests and responses to
 * use. If not supplied, depends on options.cache.default.
 * @param {Boolean} [options.cache.default] - true, then return a default
 * successful response. If not supplied, cache returns undefined (not found).
 */
function CacheStorage (options) {
  this.options = options || {};
}
CacheStorage.prototype = {
  open: function open (cacheName) {
    var cache, cacheNames = this.options.cacheNames;

    if (cacheNames) {
      cache = cacheNames[cacheName];
    } else {
      cache = new Cache(this.options.cache);
    }

    return Promise.resolve(cache);
  }
};

module.exports = {
  create: function createCacheStorage (options) {
    return new CacheStorage(options);
  },
  Cache: Cache
};
