/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Handling for a route.
 * Cache and Install route handler for a single route.
 * Allows optional Response parsing and storing of app state.
 */
/* global Promise, Request */
'use strict';

var toolbox = require('sw-toolbox');
var debug = require('../utils/debug')('routes');
var networkFirst = require('../utils/customNetworkFirst');
var requestLib = require('../utils/requests');

/**
 * Create a request for network use.
 * Adds a parameter to skip rendering.
 * Adds a parameter to make sure never cached.
 *
 * @param {Object|String} request - The Request from sw-toolbox router, or a string.
 * @return {Request} String of the new request url.
 */
function networkRequest (request) {
  var url =
    requestLib.addOrReplaceUrlSearchParameter(
      (typeof request !== 'string') ? request.url : request, 'render', '0'
    );

  url = requestLib.addOrReplaceUrlSearchParameter(url, 'cache', '1');

  url = requestLib.cacheBustRequest(url);

  return new Request(url);
}

/**
 *
 */
function updateInitData (response) {
}

/**
 * What this does:
 * 1. Fetch a route of the application and update the cache with the response.
 * 2. Install route handler for the given route.
 *
 * Route fetches add a parameter that indicates no server-side rendering
 * of the application should be done.
 * This reduces the load on the server, and the rendered application markup is not
 * required in this case, since the main app bundle is already cached.
 *
 * @param {String} route - A route of the application.
 * @param {Object} [options] - Options for behavior.
 * @param {Boolean} [options.updateInitData] - True if Response should be parsed
 * and used to update the init IDBObjectStore.
 * @return {Object} A Promise with fetchesAndCache results.
 */
module.exports = function cacheRoute (route, options) {
  debug(toolbox.options, 'received route', route);

  return networkFirst.fetchAndCache(networkRequest(route.path), route.path, {
    successResponseHandler: options.updateInitData ? updateInitData : null
  }).then(function () {
    debug(toolbox.options, 'install route handler on', route.path);

    // Install read-thru cache handler.
    toolbox.router.get(route.path, networkFirst.routeHandlerFactory(
      networkRequest, networkFirst.passThru
      // should add updateInitData to always update on this route?
      // should add updateInitData always on all routes?
      // if you don't, then stale state will creep back in.
    ), {
      debug: toolbox.options.debug
    });
  });
};
