/**
 * Copyright 2015, Alex Grant, LocalNerve, LLC.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global Promise */
'use strict';

var pathToRegexp = require('path-to-regexp');

var scope = 'http://localhost/';

var defaultOptions = {
  cache: {
    name: '$$$toolbox-cache$$$' + scope + '$$$',
    maxAgeSeconds: null,
    maxEntries: null
  },
  debug: false,
  networkTimeoutSeconds: null,
  preCacheItems: [],
  successResponses: /^0|([123]\d\d)|(40[14567])|410$/
};

function mockStrategy (response, request, values, options) {
  if (options.emulateError) {
    return Promise.reject(new Error('mock error'));
  }
  return Promise.resolve(response);
}

function mockRouteMethod (method, request, path, handler, options) {
  if (method === 'ANY' || request.method === method) {
    var values = {}, keys = [];
    var regexp = pathToRegexp(path, keys);
    var match = regexp.exec(request.url);

    if (match) {
      keys.forEach(function(key, index) {
        values[key.name] = match[index + 1];
      });

      return handler(request, values, options);
    }
  }
}

module.exports = {
  updateMockToolbox: function updateMockToolbox (request, response, options) {
    options = options || defaultOptions;
    var router = {};

    ['get', 'post', 'put', 'delete', 'head', 'any'].forEach(function (method) {
      router[method] = mockRouteMethod.bind(null, method.toUpperCase(), request);
    });

    this.cacheFirst =
    this.cacheOnly =
    this.networkFirst =
    this.networkOnly =
    this.fastest =
      mockStrategy.bind(this, response);

    this.router = router;
    this.options = options;
    this.uncache = this.precache = this.cache = function () {
    };
  }
};
