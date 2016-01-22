/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Module to contain sync operations.
 */
/* global Blob, Promise, Request, Response, fetch, self */
'use strict';

var toolbox = require('sw-toolbox');
var idb = require('../utils/idb');
var debug = require('../utils/debug')('sync');
var requestLib = require('../utils/requests');
var initApis = require('../utils/db').init({ key: 'apis' });
var filters = require('./filters');
var serviceable = require('./serviceable');

/***
 * The maximum number of times a single request can attempt synchronization.
 * This is incremented on a request when a synchronization attempt fails.
 * @see serviceAllRequests
 */
var MAX_RETRIES = 3;

/**
 * Defer a request until later by storing it in IndexedDB.
 * This is called if the fetch fails.
 *
 * NOTE:
 * 1. Stores the old csrf token in the url. Replaced when serviced later.
 * @see serviceAllRequests
 *
 * @param {String} apiPath - The key used to service the requets in proper xhrContext.
 * @param {Object} request - A Request object to use to make the post request.
 * @returns {Promise} Resolves to a Response with a status of 203 or 400.
 */
function deferRequest (apiPath, request) {
  // TODO: Update this test to ensure permissions have been obtained.
  var hasSync = !!self.registration.sync;

  return requestLib.dehydrateRequest(request, 'json')
  .then(function (dehydratedRequest) {
    var timestamp = Date.now().toString();
    var fallback = filters.getFallback(dehydratedRequest.body, true) || {};

    // Store the timestamp with the value for easier management in serviceAllRequests.
    dehydratedRequest.timestamp = timestamp;

    // Store the apiPath with the value to allow the request to be serviced
    // in the proper xhrContext in serviceAllRequests.
    dehydratedRequest.apiPath = apiPath;

    // Keep the fallback processing directives at the top level.
    dehydratedRequest.fallback = fallback;

    // Add it to IndexedDB.
    return idb.put(idb.stores.requests, timestamp, dehydratedRequest)
    .then(function () {
      return new Response('deferred', {
        // If no sync and user replayable, show user 400 failure.
        //   TODO (#15): However, replay request on next init.
        status: hasSync || !fallback.userReplayable ? 203 : 400
        // Remember, the user can replay their own requests, too.
      });
    });
  });
}

/**
 * Maintain deferred requests.
 *
 * Passes through the given Response, but maintains the deferred requests as
 * a side-effect.
 *
 * Intended to be used on successful network fetch (as a successHandler) to
 * manually remove deferred requests to avoid unintended synchronization.
 *
 * Use case: A request succeeds that renders prior deferred requests
 *  illegitimate/unwarranted/dangerous/etc.
 *
 * @param {Request} req - ignored.
 * @param {Response} res - passed through on success.
 * @param {Request} reqToCache - A clone of the Request that succeeded
 * on the network that would be used for caching and contains a fallback object.
 * @returns {Promise} Resolves to the Response on success.
 */
function maintainRequests (req, res, reqToCache) {
  return idb.all(idb.stores.requests).then(function (dehydratedRequests) {
    var request = reqToCache.clone();

    return request.json().then(function (body) {
      return serviceable.pruneRequestsByPolicy(
        dehydratedRequests,
        filters.getFallback(body)
      );
    });
  }).then(function () {
    return res;
  });
}

/**
 * Remove a fallback object (if found) from request and clone.
 *
 * @param {Object} options - Request init options to create with.
 * @param {Request} request - The request to clone.
 * @returns {Promise} Resolves to a request clone with options and
 * fallback object removed.
 */
function removeFallback (options, request) {
  var req = request.clone();

  return req.json().then(function (body) {
    // Remove the fallback object from the body
    filters.getFallback(body, true);

    return new Request(req.url, Object.assign({
      method: req.method,
      headers: req.headers,
      body: new Blob([JSON.stringify(body)], {
        type: 'application/json'
      }),
      mode: req.mode,
      credentials: req.credentials,
      cache: req.cache,
      referrer: req.referrer
    }, options));
  });
}

/**
 * Service all servicable deferred requests stored in IndexedDB requests.
 *
 * If a stored request synchronization succeeds, it is removed from storage.
 * If a stored request is deemed not serviceable, it is removed from storage.
 * If a stored request fails to sync more than MAX_RETRIES, it is abandoned.
 *
 * TODO:
 * Run on background-sync and (#15) Init message.
 * Ideally would just run on one-off sync, one scheduled on each deferral.
 * However, can also run on init - but this is not inevitable
 * like background-sync. Until background-sync gets more traction/implementation,
 * only run on init message for this example.
 *
 * @param {Object} [options] - Options object.
 * @param {RegExp} [options.successResponses] - Custom definition of http
 * success status.
 * @returns A Promise that resolves on all synchronization outcomes, rejects on
 * first failure (Promise.all).
 */
function serviceAllRequests (options) {
  var successResponses =
    options.successResponses || toolbox.options.successResponses;

  return initApis.read().then(function (apis) {
    return idb.all(idb.stores.requests).then(function (storedRequests) {
      serviceable.getRequests(storedRequests).then(function (requests) {
        serviceable.pruneRequests(storedRequests, requests).then(function () {
          return Promise.all(requests.map(function (request) {
            var req,
                timestamp = request.timestamp,
                apiInfo = apis[request.apiPath];

            // apiInfo found for this request
            if (apiInfo) {
              // rehydrate the request with up-to-date CSRF token.
              req = requestLib.rehydrateRequest(request, apiInfo);

              // Make the network request, delete the stored request on success.
              return fetch(req).then(function (response) {
                if (successResponses.test(response.status)) {
                  return idb.del(idb.stores.requests, timestamp);
                }
                throw response;
              }).catch(function (error) {
                debug('network failure', error);

                // abandonment case, 1 based failureCount - but inc'd after this
                // so count >= MAX_RETRIES (first is undef).
                if (request.failureCount &&
                    request.failureCount >= MAX_RETRIES) {
                  debug('request ABANDONED after MAX_RETRIES');

                  return idb.del(idb.stores.requests, timestamp);
                }

                // maintain failure count.
                request.failureCount = (request.failureCount || 0) + 1;
                return idb.put(idb.stores.requests, timestamp, request);
              });
            }

            // No info found for request.apiPath
            throw new Error('API Info for '+request.apiPath+' not found');
          }));
        });
      });
    });
  });
}

module.exports = {
  deferRequest: deferRequest,
  maintainRequests: maintainRequests,
  removeFallback: removeFallback,
  serviceAllRequests: serviceAllRequests
};
