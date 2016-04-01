/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
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
var apiHelpers = require('../utils/api');
var filters = require('./filters');
var serviceable = require('./serviceable');

/***
 * The maximum number of times a single request fail synchronization.
 * This is incremented on a request when a synchronization attempt fails.
 * @see serviceAllRequests
 */
var MAX_FAILURES = 3;

/**
 * Defer a request until later by storing it in IndexedDB.
 * This is called if the fetch fails.
 *
 * NOTE:
 * 1. Stores the old csrf token in the url. Replaced when serviced later.
 * @see serviceAllRequests
 *
 * @param {String} apiPath - The key used to service the requests in proper xhrContext.
 * @param {Object} request - A Request object to use to make the post request.
 * @returns {Promise} Resolves to a Response with a status of 203 or 400.
 */
function deferRequest (apiPath, request) {
  var hasSync = !!self.registration.sync;

  return requestLib.dehydrateRequest(request, 'json')
  .then(function (dehydratedRequest) {
    // This is THE source of the deferred request timestamp.
    var timestamp = Date.now().toString(),
        fallback = filters.getFallback(dehydratedRequest.body, true) || {};

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
      // If no sync and user replayable, show user a failure.
      var shouldSucceed = hasSync || !fallback.userReplayable,
          status = {
            code: 400,
            text: 'failed'
          };

      // Otherwise, it should succeed.
      // So, defer and register for a one-off background-sync if possible.
      if (shouldSucceed) {
        status.code = 203;
        status.text = 'deferred';

        if (hasSync) {
          return self.registration.sync.register(timestamp)
          .then(function () {
            return status;
          });
        }
      }

      return status;
    })
    .then(function (status) {
      return new Response(null, {
        status: status.code,
        statusText: status.text
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
        filters.getFallback(body),
        body
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
 * Service (synchronize, replay, etc.) one deferred request.
 *
 * Throws exception if apiInfo not found in supplied apis object.
 * If a deferred request synchronization succeeds, it is removed from storage.
 * If a deferred request fails to sync more than MAX_FAILURES, it is abandoned.
 *
 * @param {Object} dehydratedRequest - A dehydrated request.
 * @param {Number|String} dehydratedRequest.timestamp - The request timestamp.
 * @param {String} dehydratedRequest.apiPath - The api path for the request.
 * @param {Object} apis - An object of apiInfos, keyed by apiPath.
 * @param {Object} [options] - Options object.
 * @param {RegExp} [options.successResponses] - Custom definition of http
 * success status.
 * @param {Boolean} [options.noManage] - If truthy, don't manage fetch failure.
 * @returns {Promise} Resolves to undefined on success or continued deferral.
 * Resolves to the dehydratedRequest with updated failureCount on abandonment.
 */
function serviceOneRequest (dehydratedRequest, apis, options) {
  options = options || {};

  var req,
      timestamp = dehydratedRequest.timestamp,
      apiInfo = apis[dehydratedRequest.apiPath],
      successResponses =
        options.successResponses || toolbox.options.successResponses;

  // apiInfo found for this request
  if (apiInfo) {
    // Rehydrate the request with up-to-date CSRF token.
    req = requestLib.rehydrateRequest(dehydratedRequest, apiInfo);

    // Make the network request, delete the stored request on success.
    return fetch(req)
    .then(function (response) {
      if (successResponses.test(response.status)) {
        return idb.del(idb.stores.requests, timestamp);
      }
      throw response;
    })
    .catch(function (error) {
      if (options.noManage) {
        return Promise.reject(error);
      }

      debug('network failure', error);

      // Abandonment case, 1 based failureCount - but inc'd after this
      // so count >= MAX_FAILURES (first is undef).
      if (dehydratedRequest.failureCount &&
          dehydratedRequest.failureCount >= MAX_FAILURES) {
        debug('request ABANDONED after MAX_FAILURES', dehydratedRequest);

        return idb.del(idb.stores.requests, timestamp).then(function () {
          // Resolve to the abandoned dehydratedRequest.
          return dehydratedRequest;
        });
      }

      // Maintain failure count.
      dehydratedRequest.failureCount =
        (dehydratedRequest.failureCount || 0) + 1;

      // Update the stored dehydratedRequest (continue deferral)
      return idb.put(idb.stores.requests, timestamp, dehydratedRequest);
    });
  }

  // No apiInfo found for dehydratedRequest.apiPath
  throw new Error('API Info for '+dehydratedRequest.apiPath+' not found');
}

/**
 * Service all servicable deferred requests stored in IndexedDB requests.
 *
 * If a deferred request is deemed not serviceable, it is removed from storage.
 *
 * Ideally would just run one-off syncs, one scheduled on each deferral.
 * However, runs from init message - in case sync not supported.
 *
 * @param {Object} [options] - Options object.
 * @param {RegExp} [options.successResponses] - Custom definition of http
 * success status.
 * @returns A Promise that resolves on all synchronization outcomes, rejects on
 * first failure (Promise.all).
 */
function serviceAllRequests (options) {
  options = options || {};

  var apis, allRequests, serviceableRequests;

  return idb.get(idb.stores.init, 'apis')
  .then(function (results) {
    if (!results) {
      var msg = 'apis not found in ' + idb.stores.init;
      debug(msg);
      throw new Error(msg);
    }
    apis = results;
    return idb.all(idb.stores.requests);
  })
  .then(function (results) {
    allRequests = results;
    return serviceable.getRequests(allRequests);
  })
  .then(function (results) {
    serviceableRequests = results;
    return serviceable.pruneRequests(allRequests, serviceableRequests);
  })
  .then(function () {
    return Promise.all(serviceableRequests.map(function (dehydratedRequest) {
      return serviceOneRequest(dehydratedRequest, apis, options);
    }));
  });
}

/**
 * Handle the one-off sync event.
 *
 * 1. Get the deferred request from IndexedDB.
 * 2. Fetch valid credentials.
 *    NOTE: Fetch must be on the same origin as apiPath to get credentials.
 *          But, assumes all dehydratedRequest.apiPaths are on this origin.
 *          Also, assumes url csrf token is in the responseText.
 * 3. Service the request.
 */
self.addEventListener('sync', function (event) {
  var dehydratedRequest;

  event.waitUntil(
    idb.get(idb.stores.requests, event.tag)
    .then(function (result) {
      dehydratedRequest = result;

      if (dehydratedRequest) {
        return fetch('/?render=0', {
          credentials: 'include'
        });
      }

      throw new Error(
        'sync event did not find request w/timestamp ' + event.tag
      );
    })
    .then(function (response) {
      if (response.ok) {
        return response.text();
      }

      throw new Error(
        'sync event bad GET response'
      );
    })
    .then(apiHelpers.createXHRContextFromText)
    .then(function (xhrContext) {
      var apis = {};
      apis[dehydratedRequest.apiPath] = {
        xhrContext: xhrContext
      };

      return serviceOneRequest(dehydratedRequest, apis, {
        noManage: true
      });
    })
  );
});

module.exports = {
  deferRequest: deferRequest,
  maintainRequests: maintainRequests,
  removeFallback: removeFallback,
  serviceAllRequests: serviceAllRequests,
  MAX_FAILURES: MAX_FAILURES
};
