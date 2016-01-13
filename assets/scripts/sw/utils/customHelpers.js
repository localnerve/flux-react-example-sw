/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * A custom network strategy supportive methods.
 */
/* global Promise, fetch, caches, Response, clients */
'use strict';

var toolbox = require('sw-toolbox');
var debug = require('./debug')('customHelpers');
var jsdiff = require('diff');

/**
 * A simple utility passthrough Function
 */
function passThru (param) {
  return param;
}

/**
 * Fetch and Cache using different versions of the same request.
 * Only caches GET requests, other methods just return response promise.
 *
 * This is a common service worker pattern that works around lack of ignoreSearch
 * implementation, but could also be useful for ignoring arbitrary components of
 * the request url in the cache, network cookie preservation, changing VARY, etc.
 * @see https://code.google.com/p/chromium/issues/detail?id=426309
 *
 * @param {Request} reqNet - A Request used to fetch from the network.
 * @param {Request|String} [reqCache] - A RequestOrUrl used to update the cache.
 * Required only for GET requests.
 * @param {Object} [options] - Options to modify behavior.
 * @param {RegExp} [options.successResponses] - Defines a successful response test.
 * @param {Function} [options.successHandler] - Receives netRequest, Response,
 * cacheRequest; Returns Promise that resolves to Response.
 * Supply to optionally post process a successful network response.
 * @param {Function} [options.cacheHandler] - Receives cache, Request,
 * PreviousResponse, NewResponse; Returns Promise to Response.
 * Supply to optionally post process after cache update.
 * @return {Response} A Response Promise.
 * @throws {Response} A Response Promise if response is not successful.
 */
function fetchAndCache (reqNet, reqCache, options) {
  options = options || {};
  var successResponses = options.successResponses ||
    toolbox.options.successResponses;

  return fetch(reqNet).then(function (response) {
    if (successResponses.test(response.status)) {
      var promResponse = Promise.resolve(response);

      if (options.successHandler) {
        promResponse = options.successHandler(reqNet, response, reqCache);
      }

      return promResponse.then(function (newResponse) {
        // Only update cache for GET requests
        if (reqNet.method === 'GET') {
          return caches.open(toolbox.options.cache.name).then(function (cache) {
            debug(
              'caching successful network request:', reqCache
            );

            return cache.match(reqCache).then(function (previousResponse) {
              return cache.put(reqCache, newResponse.clone()).then(function () {
                var promCache = Promise.resolve(newResponse);

                if (options.cacheHandler) {
                  promCache = options.cacheHandler(
                    cache, reqCache, previousResponse, newResponse
                  );
                }

                return promCache.then(function (res) {
                  debug('cached response', res);
                  return res;
                });
              });
            });
          });
        }

        return newResponse;
      });
    }

    // Raise an error and trigger the catch
    throw response;
  });
}

/**
 * Get content fastest way possible.
 * Start network and get from cache, whichever finishes first wins.
 * Network response eventually updates the cache.
 * If the network response is different than a previously cached response,
 * AND the original request was satisfied from cache, calls updateHandler.
 *
 * @param {Request} reqNet - A Request used to fetch from the network.
 * @param {Request|String} reqCache - A RequestOrUrl used to update the cache.
 * @param {Function} [updateHandler] - Receives request, response, called if stale content was updated.
 * @param {Object} [options] - Passed through to fetchAndCache, cacheHandler is overwritten.
 */
function contentRace (reqNet, reqCache, updateHandler, options) {
  options = options || {};
  updateHandler = updateHandler || defaultContentUpdate;

  return new Promise(function (resolve, reject) {
    var maybeStale = false,
        rejected = false,
        errors = [];

    /**
     * Resolve this promise if the result is a Response.
     * Otherwise, start a rejection.
     */
    var conditionalResolve = function (result) {
      if (result instanceof Response) {
        resolve(result);
      } else {
        conditionalReject(result);
      }
    };

    /**
     * Reject this promise after two rejections.
     */
    var conditionalReject = function (error) {
      errors.push(error);
      if (rejected) {
        debug('Both cache and network failed');
        reject(new Error('Cache and network failed "' + errors.join('", "') + '"'));
      } else {
        rejected = true;
      }
    };

    // Overwrite/assign the defaultCacheHandler to call updateHandler when
    // the new response is different than previous.
    options.cacheHandler =
    /**
     * A cacheHandler that calls the given updateHandler when the new response is
     * different than previous.
     *
     * @param {Cache} cache - A reference to the service worker cache.
     * @param {Request} req - The request used to cache the newResponse.
     * @param {Response} prevResponse - The previously cached response.
     * Already evicted, undefined if no previous entry.
     * @param {Response} res - The new currently cached response.
     */
    function cacheHandler (cache, req, prevResponse, res) {
      if (prevResponse) {
        var newResponse = res.clone();

        debug(
          'cacheHandler comparing responses',
          prevResponse,
          newResponse
        );

        // Get the UVString representation of the responses
        return Promise.all([
          prevResponse.text(),
          newResponse.text()
        ]).then(function (contents) {
          // If the contents are 1% different and a stale response was served...
          if (nDiff(contents[0], contents[1], 1.0) && maybeStale) {
            debug(
              'cacheHandler found objects different AND stale prior response'
            );

            // Notify that there is a content update
            updateHandler(req, res);
          }
          return res;
        });
      }

      return Promise.resolve(res);
    };

    // Start network
    fetchAndCache(reqNet, reqCache, options).then(conditionalResolve)
    .catch(conditionalReject);

    // Start cache
    caches.open(toolbox.options.cache.name).then(function (cache) {
      cache.match(reqCache).then(function (response) {
        maybeStale = !!response;
        conditionalResolve(response);
      })
      .catch(conditionalReject);
    })
    .catch(conditionalReject);
  });
}

/**
 * A simple brute-force diff that returns true/false if first and second
 * are n % different.
 *
 * @param {String} oldstr - The first string to compare.
 * @param {String} newstr - The second string to compare.
 * @param {Number} threshold - The percentage threshold above which defines a
 * difference, and then the diff is true.
 * @returns true if changes exceed the threshold %.
 */
function nDiff (oldstr, newstr, threshold) {
  var changeCount = 0,
      originalCount = oldstr.length;

  jsdiff.diffChars(oldstr, newstr, {
    ignoreWhitespace: true
  }).forEach(function (change) {
    if (change.added || change.removed) {
      changeCount += change.value.length;
    }
  });

  return ((changeCount / originalCount) * 100.0) > threshold;
}

/**
 * Called to notify the client application that new content is available.
 * This is the default contentUpdate handler for contentRace.
 *
 * @param {Request} request - The request associated with the content update.
 * @returns {Promise} A promise that resolves when the update handled (no value).
 */
function defaultContentUpdate (request) {
  var requestUrl = typeof request === 'string' ? request : request.url;

  return clients.matchAll({
    type: 'window'
  }).then(function (clientWindows) {
    clientWindows.forEach(function (clientWindow) {
      if (clientWindow.url.indexOf(requestUrl) !== -1) {
        clientWindow.postMessage({
          command: 'notify',
          show: true,
          time: 3000,
          message: 'New content is available. Please refresh.'
        });
      }
    });
  });
}

module.exports = {
  contentRace: contentRace,
  fetchAndCache: fetchAndCache,
  passThru: passThru
};
