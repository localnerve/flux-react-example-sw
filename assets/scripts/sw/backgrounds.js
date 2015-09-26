/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Handling for background image requests
 */
/* global Promise, Request */
'use strict';

var toolbox = require('sw-toolbox');
var urlm = require('../../../utils/urls');
var debug = require('./debug')('backgrounds');

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
    toolbox.cache(req.clone(), options);
  }
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
 * @param {Object} values - Ignored.
 * @param {Object} options - The router options.
 */
function precacheBackgrounds (backgroundUrls, request, values, options) {
  var background,
      reCurrent, notCurrent, reqNotCurrent,
      current = urlm.getLastPathSegment(request.url);

  // precache backgrounds not for this request that are not in cache already.
  Object.keys(backgroundUrls).forEach(function (key) {
    background = urlm.getLastPathSegment(backgroundUrls[key]);

    if (current && background && current !== background) {
      // build the request for the not current background
      reCurrent = new RegExp('(' + regexEscape(current) + ')(\/)?$');
      notCurrent = request.url.replace(reCurrent, background + '$2');
      reqNotCurrent = new Request(notCurrent, {
        mode: 'no-cors'
      });

      // if reqNotCurrent not in cache, falsy will be the response given to
      // precacheBackground.
      toolbox.cacheOnly(reqNotCurrent).then(
        precacheBackground.bind(this, options, reqNotCurrent)
      );
    }
  });

  // want fastest, but it has a bug (or works unexpectedly)
  return toolbox.networkFirst(request, values, options);
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

  // Nothing deferred, so return placeholder Promise
  return new Promise(function (resolve) {
    resolve();
  });
};
