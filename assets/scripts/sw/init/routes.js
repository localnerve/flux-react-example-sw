/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Handling for routes
 */
/* global Promise, Request */
'use strict';

var toolbox = require('sw-toolbox');
var debug = require('../utils/debug')('routes');
var networkFirst = require('../utils/customNetworkFirst');
var requestLib = require('../utils/requests');

/**
 * Create a request for network use.
 * Adds a parameter to tell the server to skip rendering.
 * Adds a parameter to tell the server this is for offline cache purpose.
 * Adds credentials.
 *
 * @param {Object|String} request - The Request from sw-toolbox router, or a string.
 * @param {Boolean} forCache - Used to indicate this request is for cache population.
 * @returns String of the new request url.
 */
function networkRequest (request, forCache) {
  var url =
    requestLib.addOrReplaceUrlSearchParameter(
      (typeof request !== 'string') ? request.url : request, 'render', '0'
    );

  if (forCache) {
    // If the server can reduce it's workload further because this is for
    // offline use later, then let it know that.
    url = requestLib.addOrReplaceUrlSearchParameter(url, 'cache', '1');
  }

  return new Request(url, {
    credentials: 'include'
  });
}

/**
 * What this does:
 * 1. Fetch the mainNav routes of the application and update the cache with the responses.
 * 2. Install route handlers for all the main nav routes.
 *
 * Route fetches add a parameter that indicates no server-side rendering
 * of the application should be done.
 * This reduces the load on the server, and the rendered application markup is not
 * required in this case, since the main app bundle is already cached.
 *
 * @param {Object} payload - The payload of the init message.
 * @param {Object} payload.RouteStore.routes - The routes of the application.
 * @return {Object} A Promise with all aggregate route fetchesAndCache results.
 */
module.exports = function cacheRoutes (payload) {
  var routes = payload.RouteStore.routes;

  debug(toolbox.options, 'received routes', routes);

  return Promise.all(Object.keys(routes).map(function (route) {
    if (routes[route].mainNav) {
      var url = routes[route].path;

      debug(toolbox.options, 'cache route', url);

      // Fetch and cache the mainNav route.
      return networkFirst.fetchAndCache(networkRequest(url, true), url)
      .then(function () {
        debug(toolbox.options, 'install route handler on', url);

        // Install read-thru cache handler.
        toolbox.router.get(url, networkFirst.routeHandlerFactory(
          networkRequest, networkFirst.passThru
        ), {
          debug: toolbox.options.debug
        });

        return Promise.resolve();
      });
    }

    return Promise.resolve();
  }));
};
