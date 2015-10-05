/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Module to contain request handling operations.
 */
/* global Promise, Response, Request, Blob, URL, fetch, self */
'use strict';

var toolbox = require('sw-toolbox');
var idb = require('./idb');
var initApis = require('../init/apis');

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

  return dehydrateRequest(request, 'json').then(function (dehydratedRequest) {
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

  // Read all requests from IndexedDB
  return idb.all(idb.stores.requests).then(function (requests) {
    return Promise.all(requests.map(function (request) {
      var key = request.key;

      // Lookup this request's current api info by apiPath.
      return initApis.readInitApis().then(function (payload) {
        var req, apiInfo = payload[request.apiPath];

        // Info found for request.apiPath
        if (apiInfo) {
          req = rehydrateRequest(request, apiInfo);

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
      });
    }));
  });
}

/**
 * Utility method to dehydrate a Request to a plain object for IDBObjectStore.
 *
 * @private
 *
 * @param {Request} request - The input Request object.
 * @param {String} bodyType - One of the Request Body methods: arrayBuffer,
 * blob, json, text, or formData
 * @returns Promise resolves to dehydrated request state.
 */
function dehydrateRequest (request, bodyType) {
  var bodyGetter = request[bodyType];

  return bodyGetter.call(request).then(function (body) {
    return {
      method: request.method,
      url: request.url,
      bodyType: bodyType,
      body: body
    };
  });
}

/**
 * Utility method to rehydrate a Request from a plain object from IDBObjectStore.
 *
 * @private
 *
 * @param {Object} state - The dehydrated request state.
 * @param {Object} [apiInfo] - contains timeout, cors, and CSRF token to use.
 * If specified, any existing csrf value in the request state url is replaced,
 * or a new key/value is added to the end of the url.
 * @param {Object} [apiInfo.xhrContext] - contains csrfToken.
 * @param {String} [apiInfo.xhrContext._csrf] - The csrfToken.
 * @return A new Request object from state.
 */
function rehydrateRequest (state, apiInfo) {
  var body, url, reCsrf, csrfName = '_csrf';

  var csrfToken = apiInfo.xhrContext[csrfName];

  // If csrfToken specified, add/replace one in the body and url
  if (csrfToken) {
    reCsrf = new RegExp('(&'+csrfName+'=)([^&]+)');

    // replace/add the csrfToken in the url.
    if (reCsrf.test(state.url)) {
      url = state.url.replace(reCsrf, '$1'+csrfToken);
    } else {
      url = state.url + ( (new URL(state.url)).search ? '&' : '?' );
      url += [csrfName, csrfToken].join('=');
    }

    // replace/add the csrfToken in the body.
    if (state.body.context && state.body.context[csrfName]) {
      state.body.context[csrfName] = csrfToken;
    }
  }

  // Only supporting json bodyType for this app.
  if (state.bodyType === 'json') {
    body = new Blob([JSON.stringify(state.body)], {
      type: 'application/json'
    });
  }

  return new Request (url, {
    method: state.method,
    body: body,
    credentials: 'include'
  });
}

module.exports = {
  deferRequest: deferRequest,
  serviceAllRequests: serviceAllRequests
};
