/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Handling for dynamic routes.
 *
 * NOTE: idempotent? toolbox router Map will have old routes in it.
 * TODO: Investigate/Handle that little issue
 *   (exists for apiRequests and Backgrounds also).
 */
/* global Promise, Request, URL, location */
'use strict';

var toolbox = require('sw-toolbox');
var debug = require('../utils/debug')('init.routes');
var helpers = require('../utils/customHelpers');
var fastest = require('../utils/customFastest');
var idb = require('../utils/idb');
var requestLib = require('../utils/requests');

/**
 * Create a request for network use.
 * Adds a parameter to tell the server to skip rendering.
 * Includes credentials.
 *
 * Route requests require a parameter that indicates no server-side rendering
 * of the application should be done.
 * This reduces the load on the server. The rendered application markup is not
 * required in this case, since the main app bundle is already cached.
 *
 * @param {Object|String} request - The Request from sw-toolbox router, or a string.
 * @returns String of the new request url.
 */
function networkRequest (request) {
  var url =
    requestLib.addOrReplaceUrlSearchParameter(
      (typeof request !== 'string') ? request.url : request, 'render', '0'
    );

  return new Request(url, {
    credentials: 'include'
  });
}

/**
 * Create a request for cache.
 *
 * This exists because:
 * ignoreSearch option is not implemented yet in cache.match/matchAll,
 * so we stripSearchParameters to ignoreSearch ourselves in the request we cache.
 * https://code.google.com/p/chromium/issues/detail?id=426309
 *
 * Response from Google:
 * https://github.com/GoogleChrome/sw-toolbox/issues/35
 *
 * @param {Object} request - A Request object from sw-toolbox.
 * @returns A string of the modified request url to be used in caching.
 */
function cacheRequest (request) {
  return requestLib.stripSearchParameters(request.url);
}

/**
 * Add the given successful request url and timestamp to init.routes IDB store.
 * This handler stores the request as a side effect and just returns the response.
 *
 * @param {Request} request - The request of the successful network fetch.
 * @param {Response} response - The response of the successful network fetch.
 * @returns {Promise} A Promise resolving to the input response.
 */
function addSkipRoute (request, response) {
  return idb.put(idb.stores.init, 'skipRoute', {
    url: request.url,
    timestamp: Date.now()
  }).then(function () {
    return response;
  });
}

/**
 * Look up the given url in skipRoute to see if fetchAndCache should be skipped.
 *
 * @param {String} url - The url pathname to test.
 * @returns {Promise} Promise resolves to Boolean, true if cache should be skipped.
 */
function getSkipRoute (url) {
  // Anything older than this and its like it didn't happen
  var maxAge = 1000 * 10;

  return idb.get(idb.stores.init, 'skipRoute').then(function (skipRoute) {
    var age, skipUrl;

    if (skipRoute) {
      age = Date.now() - skipRoute.timestamp;
      skipUrl = (new URL(skipRoute.url, location.origin)).pathname;

      if (age < maxAge && url === skipUrl) {
        debug(toolbox.options, 'skipping fetchAndCache for '+url);
        return true;
      }
    }

    return false;
  });
}

/**
 * Install a read-thru cache handler for the given route url.
 * Also, try to precache the route.
 *
 * @param {String} url - The url to cache and install.
 * @returns {Promise} A Promise resolving on success (no sig value).
 */
function cacheAndInstallRoute (url) {
  debug(toolbox.options, 'cache route', url);

  // This has to happen regardless of the precache outcome.
  installRouteGetHandler(url);

  // Must handle errors here, precache error is irrelevant beyond here.
  return helpers.contentRace(networkRequest(url), url)
  .catch(function (error) {
    debug(toolbox.options.debug, 'failed to precache ' + url);
  });
}

/**
 * Install a read-thru cache handler for the given route url.
 *
 * @param {String} url - The url to install route GET handler on.
 * @returns {Promise} A Promise resolving on success (no sig value).
 */
function installRouteGetHandler (url) {
  debug(toolbox.options, 'install route GET handler on', url);

  toolbox.router.get(url, fastest.routeHandlerFactory(
    networkRequest, cacheRequest
  ), {
    debug: toolbox.options.debug,
    successHandler: addSkipRoute
  });

  return Promise.resolve();
}

/**
 * What this does:
 * 1. Fetch the mainNav routes of the application and update the cache with the responses.
 * 2. Install route handlers for all the main nav routes.
 *
 * The route GET handler will be the start of a main navigation entry point for
 * the application. It will be fetched and cached from the network, unless offline.
 * The page returned, if it has new data from the server, will cause an 'init'
 * command to execute.
 * So, to prevent a route from being fetched and cached twice, a skipRoute
 * lookaside scheme is used to keep track of routes recently fetched and cached
 * from the route GET handler.
 *
 * @param {Object} payload - The payload of the init message.
 * @param {Object} payload.RouteStore.routes - The routes of the application.
 * @returns {Promise} A Promise with all aggregate route results.
 */
module.exports = function cacheRoutes (payload) {
  var routes = payload.RouteStore.routes;

  debug(toolbox.options, 'received routes', routes);

  return Promise.all(Object.keys(routes).map(function (route) {
    if (routes[route].mainNav) {
      var url = routes[route].path;

      return getSkipRoute(url).then(function (skipCache) {
        if (skipCache) {
          return installRouteGetHandler(url);
        }
        return cacheAndInstallRoute(url);
      }).catch(function (error) {
        debug(toolbox.options, 'failed to get skipRoute', error);
        return cacheAndInstallRoute(url);
      });
    }

    return Promise.resolve();
  }));
};
