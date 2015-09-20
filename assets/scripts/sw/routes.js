/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Handling for routes
 */
/* global Promise */
'use strict';

var toolbox = require('sw-toolbox');

/**
 * Fetch the main navigation routes of the application and update the cache.
 *
 * On the precache:
 * If the server supported it, here would be a good place to add a parameter
 * that indicates the server should not do server-side render, only rely on
 * client side render. This would take load off the server for these prefetches,
 * and the main app bundle is already cached.
 *
 * @param {Object} payload - The payload of the
 */
module.exports = function cacheRoutes (payload) {
  var promises = [];

  Object.keys(payload.RouteStore.routes)
    .forEach(function (route) {
      if (payload.RouteStore.routes[route].mainNav) {
        var url = payload.RouteStore.routes[route].path;

        if (toolbox.options.debug) {
          console.log('[sw routes] caching:', url);
        }

        // Install a read-thru cache on the mainNav route.
        toolbox.router.get(url, toolbox.networkFirst, {
          debug: toolbox.options.debug
        });

        // Precache the route.
        promises.push(toolbox.cache(url));
      }
    });

  return Promise.all(promises);
};
