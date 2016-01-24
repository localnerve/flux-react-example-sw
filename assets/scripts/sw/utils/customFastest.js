/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * A custom "fastest strategy" sw-toolbox route handler, factory, and supportive
 * methods.
 *
 * Fastest Strategy
 * The fastest strategy checks cache and network, returns whichever wins the race.
 * The network result always updates the cache for next time.
 *
 * Custom Fastest Strategy
 * The custom fastest strategy is like the fastest strategy except, in the
 * network case, if the cache update would result in an actual difference, AND
 * a stale cached copy was served, a message is sent that notifies the UI.
 */
'use strict';

var helpers = require('./customHelpers');

/**
 * A customized fastest cache strategy.
 * Race network and cache, return the first responder.
 * When network finally returns, update the cache.
 * If network caused an update making the prior response stale, notify UI.
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
 * contentUpdate is called if the network response is different than a prior
 * cached response, and the route handler already responded with what must be
 * a stale response from cache.
 *
 * NOTE: I'm not 100% sure the text() method will operate correctly on a json body.
 *
 * @param {Function} fetchRequest - Produces the network request, given the original.
 * @param {Function} cacheRequest - Produces the cache request, given the original.
 * @param {Function} contentUpdate - Called if a network request caused a content update
 * AND a stale response was returned prior.
 * @return {Function} An sw-toolbox route handler (request, values, options)
 */
function routeHandlerFactory (fetchRequest, cacheRequest, contentUpdate) {
  /**
   * The custom fastest sw-toolbox route handler
   *
   * @param {Request} request - The request from sw-toolbox router.
   * @param {Object} values - route values, not used.
   * @param {Object} [options] - The options passed to sw-toolbox router.
   * @param {Function} [options.successHandler] - Receives the Request and Response for
   * optional post processing of successful fetch.
   * @param {Function} [options.cacheHandler] - Will be overwritten if supplied.
   * @return {Promise} Resolves to a Response on success.
   */
  return function customFastest (request, values, options) {
    options = options || {};

    // Make the network and cache requests
    var reqNet = fetchRequest(request),
        reqCache = cacheRequest(request);

    return helpers.contentRace(reqNet, reqCache, contentUpdate, options);
  };
}

module.exports = {
  routeHandlerFactory: routeHandlerFactory
};
