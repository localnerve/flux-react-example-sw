/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Handling for routes
 */
/* global Promise */
'use strict';

var toolbox = require('sw-toolbox');
var debug = require('../utils/debug')('routes');

/**
 * What this does:
 * 1. Fetch the mainNav routes of the application and update the cache with the responses.
 * 2. Install route handlers for all the main nav routes.
 *
 * NOTE:
 * If the server supported it, here would be a good place to add a parameter
 * that indicates the server should not do server-side application render, only rely on
 * client side render. This would take load off the server for these prefetches.
 * In an offline state, the main app bundle is already cached, so client-side only
 * rendering would suffice.
 *
 * Currently, without this support, this is very much increasing the work the server
 * has to do to render the app by many times (work x mainNav-routes times).
 *
 * TODO:
 * Add server support for doing 'helmet' only renders, in which it does not
 * run the application render, but only serves the static html and state, relying
 * solely on the client side render of the application.
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
      toolbox.router.get(url, toolbox.networkFirst, {
        debug: toolbox.options.debug
      });

      debug(toolbox.options, 'cache route', url);

      // Add the route to the cache.
      results.push(toolbox.cache(url));
    }
  });

  return Promise.all(results).catch(function (error) {
    debug(toolbox.options, 'failed to cache route', error);
  });
};
