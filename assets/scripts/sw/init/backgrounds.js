/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Handling for background image requests.
 * NOTE: Not really idempotent, because toolbox router Map will have old routes in it.
 * TODO: Handle that little issue.
 */
/* global Promise, Request, caches */
'use strict';

var toolbox = require('sw-toolbox');
var urlm = require('../../../../utils/urls');
var debug = require('../utils/debug')('init.backgrounds');

/**
 * Escape a string for usage in a regular expression.
 */
function regexEscape(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * Precache a request if the response does NOT exist.
 *
 * @param {Object} options - options to accompany the cache operation.
 * @param {Object} req - The Request object to cache.
 * @param {Object} res - The Response object, if null, Request should be cached.
 */
function precacheBackground (options, req, res) {
  if (!res) {
    debug(options, 'precaching background', req);
    return toolbox.cache(req.clone(), options);
  }
  return Promise.resolve();
}

/**
 * A precaching read-thru cache
 * When a background request comes in, checks against the other backgrounds.
 * If one or more of the other backgrounds is not in the cache, fetch and cache
 * them right now.
 * Serve the current background request, updating the cache as you go.
 *
 * @param {Object} backgroundUrls - The backgroundUrls used to init the BackgroundStore.
 * @param {Object} request - A Request object
 * @param {Object} values - Ignored, passed on to networkFirst strategy.
 * @param {Object} options - The router options.
 */
function precacheBackgrounds (backgroundUrls, request, values, options) {
  // precache/prefetch backgrounds that will be needed next that are not already cached.
  // NOTE: This is an async side-effect - we don't wait for (or handle) the result.
  Promise.all(Object.keys(backgroundUrls).map(function (key) {
    var background = urlm.getLastPathSegment(backgroundUrls[key]),
        reCurrent, notCurrent, reqNotCurrent,
        current = urlm.getLastPathSegment(request.url);

    if (current && background && current !== background) {
      // build the request for the next background
      reCurrent = new RegExp('(' + regexEscape(current) + ')(\/)?$');
      notCurrent = request.url.replace(reCurrent, background + '$2');
      reqNotCurrent = new Request(notCurrent, {
        mode: 'no-cors' // these are from a cdn
      });

      // if reqNotCurrent not in cache, a falsy response will be given to
      // precacheBackground.
      return caches.open(toolbox.options.cache.name).then(function (cache) {
        return cache.match(reqNotCurrent).then(
          precacheBackground.bind(this, options, reqNotCurrent)
        );
      });
    }
  })).catch(function (error) {
    debug(toolbox.options, 'Error prefetching next backgrounds:', error);
  });

  return toolbox.fastest(request, values, options);
}

/**
 * Cache background images for the app
 */
module.exports = function backgroundHandler (payload) {
  var backgroundStore = payload.BackgroundStore;

  debug(toolbox.options, 'install background image handler', backgroundStore);

  // Install a precaching, read-thru cache on all requests to the background image service
  toolbox.router.get('*',
    precacheBackgrounds.bind(this, backgroundStore.backgroundUrls), {
    debug: toolbox.options.debug,
    origin: urlm.getHostname(backgroundStore.imageServiceUrl)
  });

  // Nothing deferred (yet), so return a resolved Promise
  return Promise.resolve();
};
