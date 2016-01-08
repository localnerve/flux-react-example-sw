/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Handling for api requests.
 *
 * NOTE:
 *   The pre-emptive timeout shown here is a general use case that doesn't
 *   actually exist for GET requests in this demo application.
 *   This application caches the api GET content in stores (app layer) and never
 *   makes another Request. Flux Store caching is the desired behavior for this
 *   app demo as it shows off flux and also works well in browsers that don't
 *   support service worker.
 *
 *   However, you can see how this works here - It's fun:
 *   Adjust the devtool network preset to slowest and change
 *   the factorCacheFailoverTime below to a very small percentage (0.1).
 *   navigate to a page that falls back to
 *   a resourceContentResponse fallback to see it in live action.
 *   If you have set the timing just right, you can navigate to a page with
 *   a standard api call and see the cache failover fail AND the normal (slowed)
 *   response come in under the wire, satisfy the request, and win the race -
 *   resulting in api content being displayed anyway. Pretty robust.
 *
 *   Who knows, maybe you'll need an api that is not cached in the
 *   app layer? If so, cache in the service worker as demonstrated here, and
 *   never timeout.
 *
 *   However, the pre-emptive timeout is effective for api POST requests.
 */
/* global Promise, Request */
'use strict';

var toolbox = require('sw-toolbox');
var stores = require('./stores');
var sync = require('../sync');
var debug = require('../utils/debug')('apiRequests');
var networkFirst = require('../utils/customNetworkFirst');
var requestLib = require('../utils/requests');

/***
 * factorCacheFailoverTime
 * Timeout preemptively to prevent application timeout and serve from cache
 * instead.
 *
 * This is the factor to alter the xhr timeout of the app's xhr requests.
 * Intended to be between 0.1 and 1.0.
 * Why?
 * This serves to reduce the service worker effective timeout below the value
 * used by the main application. By timing out sooner, this proxy can deliver a
 * cached response before the application can timeout.
 * The idea is that the app never experiences a content miss because of network
 * problems.
 *
 * Change this to 0.1 to play around with slow network fallback behaviors.
 */
var factorCacheFailoverTime = 0.85; // if 85% of app timeout, serve from cache.

var defaultXhrTimeout = 3000;

var defaultXhrPath = '/api';

/**
 * Create the network request for fetch.
 *
 * Api is CSRF protected, so we include the cookie.
 *
 * @param {Object} request - The Request object from sw-toolbox.
 * @returns A Request object that includes the cookie.
 */
function networkRequest (request) {
  // Thought 'same-origin' would work by spec, but it doesn't. 'include' does.
  return new Request(request.clone(), { credentials: 'include' });
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
 * Install route handlers for all api paths.
 *
 * GETS:
 *   Network First, Fallback to Cache, Fallback to Content
 *   For every app render, on any entry route, there is always one api GET that
 *   is never made, because it is not required - it was already made on the
 *   server for the initial render - but its data is available in app state
 *   (in the ContentStore). This is why stores.resourceContentResponse is used
 *   for cacheMissFallback.
 *
 * GET Example:
 *   The api get for the home route is not made for the app rendered on '/'.
 *   While offline, if the user starts the app on /contact and goes to '/', that
 *   req-res mapping will not be in the cache. resourceContentResponse synths
 *   the response from the content already stored from the initial render.
 *
 * POSTS:
 *  Network first, fallback to defer request.
 *  When a post request fails, defer the request for later processing.
 *  (More to come)
 *
 *  @see sw/sync.js
 *
 * @param {Object} payload - A keyed object of api infos, ala Yahoo Fetchr.
 * One key per api.
 * @param {String} payload.KEY.xhrPath - The base path of the api endpoint.
 * @param {Number} payload.KEY.xhrTimeout - The timeout of the api.
 * @returns {Promise} a Promise that resolves to undefined when work complete.
 */
module.exports = function apiRequests (payload) {
  var xhrTimeout, xhrPath;

  // For each defined api...
  Object.keys(payload).forEach(function (key) {
    xhrPath = payload[key].xhrPath || defaultXhrPath;
    xhrTimeout = parseInt(payload[key].xhrTimeout, 10) || defaultXhrTimeout;

    debug(toolbox.options, 'install api handler', xhrPath);

    // Handle GET requests, fail to cache, fail to resourceContent
    toolbox.router.get(xhrPath + '*',
      networkFirst.routeHandlerFactory(
        networkRequest, cacheRequest, stores.resourceContentResponse
      ), {
        debug: toolbox.options.debug,
        networkTimeout: xhrTimeout * factorCacheFailoverTime
      }
    );

    // Handle POST requests, fail to sync.deferRequest
    toolbox.router.post(xhrPath + '*',
      networkFirst.routeHandlerFactory(
        networkRequest, networkRequest, sync.deferRequest.bind(null, xhrPath)
      ), {
        debug: toolbox.options.debug,
        networkTimeout: xhrTimeout * factorCacheFailoverTime
      }
    );
  });

  // Nothing deferred (yet), so return a resolved Promise
  return Promise.resolve();
};
