/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Module to contain sync operations.
 */
/* global Promise, Response, fetch, self */
'use strict';

var toolbox = require('sw-toolbox');
var idb = require('../utils/idb');
var debug = require('../utils/debug')('sync');
var requestLib = require('../utils/requests');
var initApis = require('../init/apis');
var filters = require('./filters');
var serviceable = require('./serviceable');

/***
 * The maximum number of times a single request can attempt synchronization.
 * This is incremented on a request when a synchronization attempt fails.
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
 * @return A Promise that resolves to Response that reflects the success or failure of this operation.
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
        // If no sync and user replayable, show user failure.
        //   TODO: However, replay request on next init.
        status: hasSync || !fallback.userReplayable ? 203 : 400
        // Remember, the user can replay their own requests, too.
      });
    });
  });
}

/**
 * Service all requests.
 *
 * TODO: Run on background-sync.
 * Ideally would run on one-off sync, one scheduled on each deferral.
 * However, can also run on init - but this is not inevitable
 * like background-sync. Until background-sync gets more traction/implementation,
 * only run on init message for this example.
 *
 * If a stored request synchronization succeeds, it is removed from storage.
 * If a stored request is deemed not serviceable, it is removed from storage.
 * If a stored request fails to sync more than MAX_RETRIES, it is abandoned.
 *
 * @param {Object} [options] - Options that can define successResponses RegExp.
 * @return A Promise that resolves on all synchronization outcomes, rejects on
 * first failure (Promise.all).
 */
function serviceAllRequests (options) {
  var successResponses =
    options.successResponses || toolbox.options.successResponses;

  return initApis.readInitApis().then(function (apis) {
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
  serviceAllRequests: serviceAllRequests
};
