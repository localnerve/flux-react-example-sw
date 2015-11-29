/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * A custom network first sw-toolbox route handler and factory
 */
/* global caches */
'use strict';

var toolbox = require('sw-toolbox');
var helpers = require('./customHelpers');
var debug = require('./debug')('customNetworkFirst');

/**
 * A customized networkFirst cache strategy.
 * Nominal behavior is read-thru caching from network.
 * If network fails, fallback to cache.
 *
 * Specializations:
 *
 * Allows fetch and cache with two different versions of the request:
 *   One version for fetching the response from the network.
 *   One version for cache matching/updating.
 * This is a common service worker pattern that works around lack of ignoreSearch
 * implementation, but could also be useful for ignoring arbitrary components of
 * the request url in the cache, network cookie preservation, changing VARY, etc.
 * @see https://code.google.com/p/chromium/issues/detail?id=426309
 *
 * Allow optional cache fallback behavior.
 * If cache fallback fails, executes cacheFallback if specified.
 *
 * @param {Function} fetchRequest - Produces the network request, given the original.
 * @param {Function} cacheRequest - Produces the cache request, given the original.
 * @param {Function} [cacheFallback] - Receives the cacheRequest,
 * returns a Promise (resolves to) Response in the event of a fallback cache miss.
 * @return {Function} An sw-toolbox route handler (request, values, options)
 */
function routeHandlerFactory (fetchRequest, cacheRequest, cacheFallback) {
  /**
   * The custom network first sw-toolbox route handler
   *
   * @param {Request} request - The request from sw-toolbox router.
   * @param {Object} values - route values, not used.
   * @param {Object} [options] - The options passed to sw-toolbox router.
   * @param {Function} [options.successHandler] - Receives the Request and Response for
   * optional post processing of successful fetch.
   * @return {Promise} Resolves to a Response on success.
   */
  return function customNetworkFirst (request, values, options) {
    options = options || {};

    // Make the network and cache requests
    var reqNet = fetchRequest(request),
        reqCache = cacheRequest(request);

    return helpers.fetchAndCache(reqNet, reqCache, options).catch(function (error) {
      debug(options, 'network req failed, fallback to cache', error);

      // Returned cached response, if none, try cacheFallback if exists.
      return caches.open(toolbox.options.cache.name).then(function (cache) {
        var response = cache.match(reqCache);

        return response.then(function (data) {
          if (!data && cacheFallback) {
            return cacheFallback(reqCache);
          }
          return response;
        });
      });
    });
  };
}

module.exports = {
  routeHandlerFactory: routeHandlerFactory
};
