/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Handling for routes
 */
/* global Promise, Request, URL, location */
'use strict';

var toolbox = require('sw-toolbox');
var debug = require('../utils/debug')('routes');
var networkFirst = require('../utils/customNetworkFirst');

/**
 * Create a request for network use.
 * Adds a parameter to skip rendering.
 *
 * @param {Object|String} request - The Request from sw-toolbox router, or a string.
 * @returns String of the new request url.
 */
function networkRequest (request) {
  var skipRenderParam = 'render=0',
      requestUrl = (typeof request !== 'string') ? request.url : request,
      skipRenderUrl = new URL(requestUrl, location.origin);

  if (skipRenderUrl.search) {
    skipRenderUrl.search += '&' + skipRenderParam;
  } else {
    skipRenderUrl.search = '?' + skipRenderParam;
  }

  return new Request(skipRenderUrl.toString());
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
 */
module.exports = function cacheRoutes (payload) {
  var results = [];
  var routes = payload.RouteStore.routes;

  debug(toolbox.options, 'received routes', routes);

  Object.keys(routes).forEach(function (route) {
    if (routes[route].mainNav) {
      var url = routes[route].path;

      debug(toolbox.options, 'install route handler on', url);

      // Install a read-thru cache handler on the mainNav route.
      toolbox.router.get(url, networkFirst.routeHandlerFactory(
        networkRequest, networkFirst.passThru
      ), {
        debug: toolbox.options.debug
      });

      debug(toolbox.options, 'cache route', url);

      // Fetch the route and add the response to the cache.
      results.push(networkFirst.fetchAndCache(networkRequest(url), url));
    }
  });

  return Promise.all(results).catch(function (error) {
    debug(toolbox.options, 'failed to cache route', error);
  });
};
