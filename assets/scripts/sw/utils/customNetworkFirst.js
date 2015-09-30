/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global fetch, caches, URL */
'use strict';

var toolbox = require('sw-toolbox');
var debug = require('./debug')('customNetworkFirst');

/**
 * strip search!
 * Removes the search/query portion from a URL.
 * E.g. stripSearchParameters("http://example.com/index.html?a=b&c=d")
 *     ➔ "http://example.com/index.html"
 */
function stripSearchParameters(url) {
  var strippedUrl = new URL(url);
  strippedUrl.search = '';
  return strippedUrl.toString();
}

/**
 * A simple utility passthrough Function
 */
function passThru (param) {
  return param;
}

/**
 * Fetch and Cache using different versions of the same request.
 * Only caches GET requests, other methods just return response promise.
 *
 * This is a common service worker pattern that works around lack of ignoreSearch
 * implementation, but could also be useful for ignoring arbitrary components of
 * the request url in the cache, network cookie preservation, changing VARY, etc.
 * @see https://code.google.com/p/chromium/issues/detail?id=426309
 *
 * @param {Object} reqNet - A Request used to fetch from the network.
 * @param {Object|String} [reqCache] - A RequestOrUrl used to update the cache. Required only for GET requests.
 * @param {Object} [options] - Specifies successResponses regexp.
 * @returns A Response Promise.
 * @throws A Response Promise if response is not successful.
 */
function fetchAndCache (reqNet, reqCache, options) {
  options = options || {};
  var successResponses = options.successResponses || toolbox.options.successResponses;

  return fetch(reqNet).then(function (response) {
    if (successResponses.test(response.status)) {
      // Only update cache for GET requests
      if (reqNet.method === 'GET') {
        return caches.open(toolbox.options.cacheName).then(function (cache) {
          debug(
            toolbox.options, 'caching successful network request as:', reqCache
          );
          return cache.put(reqCache, response.clone()).then(function () {
            return response;
          });
        });
      }
      return response;
    }
    // Raise an error and trigger the catch
    throw response;
  });
}

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
 * @param {Function} [cacheFallback] - Returns a promise w/Response in the event of a fallback cache miss.
 * @returns A sw-toolbox route handler (request, values, options)
 */
function routeHandlerFactory (fetchRequest, cacheRequest, cacheFallback) {
  /**
   * The custom network first sw-toolbox route handler
   */
  return function customNetworkFirst (request, values, options) {
    options = options || {};

    // Make the network and cache requests
    var reqNet = fetchRequest(request),
        reqCache = cacheRequest(request);

    return fetchAndCache(reqNet, reqCache, options).catch(function (error) {
      debug(options, 'network req failed, fallback to cache', error);

      // Returned cached response, if none, try cacheFallback if exists.
      return caches.open(toolbox.options.cacheName).then(function (cache) {
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
  fetchAndCache: fetchAndCache,
  passThru: passThru,
  routeHandlerFactory: routeHandlerFactory,
  stripSearchParameters: stripSearchParameters
};
