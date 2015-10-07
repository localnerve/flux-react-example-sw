/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Module to contain sync operations.
 */
/* global Promise, Response, fetch, self */
'use strict';

var toolbox = require('sw-toolbox');
var idb = require('./utils/idb');
var requestLib = require('./utils/requests');
var initApis = require('./init/apis');

/**
 * Defer a request until later by storing it in IndexedDB.
 * This is called if the fetch fails.
 *
 * NOTE:
 * 1. Stores the old csrf token in the url. Must replace when serviced later.
 *
 * @param {String} apiPath - The key used to service the requets in proper xhrContext.
 * @param {Object} request - A Request object to use to make the post request.
 * @return A Promise that resolves to Response that reflects the success or failure of this operation.
 */
function deferRequest (apiPath, request) {
  // TODO: Update this test to ensure permissions have been obtained.
  var hasSync = !!self.registration.sync;

  return requestLib.dehydrateRequest(request, 'json').then(function (dehydratedRequest) {
    var key = Date.now().toString();

    // Store the key with the value for easier management in serviceAllRequests.
    dehydratedRequest.key = key;

    // Store the apiPath with the value to allow the request to be serviced
    // in the proper xhrContext in serviceAllRequests.
    dehydratedRequest.apiPath = apiPath;

    // Add it to IndexedDB.
    return idb.put(idb.stores.requests, key, dehydratedRequest)
      .then(function () {
        return new Response('deferred', {
          // If no sync, show user failure, However, replay request on next init.
          status: hasSync ? 203 : 400
          // Remember, the user can replay their own requests, too.
        });
      });
  });
}

/**
 * Service all requests.
 * If a stored request succeeds, it is removed from storage.
 *
 * TODO:
 * 1. Need to mark requests with failure count (or time expiration) so that
 * there can be an end game. You can't service requests forever.
 *
 * @param {Object} [options] - Options that can define successResponses RegExp.
 * @return A Promise that resolves/rejects on all fetch outcomes.
 */
function serviceAllRequests (options) {
  var successResponses = options.successResponses || toolbox.options.successResponses;

  return initApis.readInitApis().then(function (apis) {
    return idb.all(idb.stores.requests).then(function (requests) {
      return Promise.all(requests.map(function (request) {
        var req,
            key = request.key,
            apiInfo = apis[request.apiPath];

        // apiInfo found for this request
        if (apiInfo) {
          req = requestLib.rehydrateRequest(request, apiInfo);

          // Make the network request, delete the stored request on success.
          return fetch(req).then(function (response) {
            if (successResponses.test(response.status)) {
              return idb.del(idb.stores.requests, key);
            }
            throw response;
          });
          // TODO: catch here and add attempt count
        }

        // No info found for request.apiPath
        throw new Error('API Info for '+request.apiPath+' not found');
      }));
    });
  });
}

module.exports = {
  deferRequest: deferRequest,
  serviceAllRequests: serviceAllRequests
};
