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

/**
 * Escape a string for usage in a regular expression.
 */
function regexEscape(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * A precaching read-thru cache
 * When a background request comes in, checks against the other backgrounds.
 * If one or more of the other backgrounds is not in the cache, fetch and cache
 * them right now.
 * Serve the current background request in the fastest way, updating the cache.
 *
 * @param {Object} backgroundUrls - The backgroundUrls used to init the BackgroundStore.
 * @param {Object} request - A Request object
 * @param {Object} values - A values object used by toolbox router routes.
 * @param {Object} options - The router options.
 */
function precacheBackgrounds (backgroundUrls, request, values, options) {
  var background,
      notCurrent, reqNotCurrent,
      reCurrent, current = urlm.getLastPathSegment(request.url);

  // precache backgrounds not for this request that are not in cache already.
  Object.keys(backgroundUrls).forEach(function (key) {
    background = urlm.getLastPathSegment(backgroundUrls[key]);

    if (current && background && current !== background) {
      reCurrent = new RegExp('(' + regexEscape(current) + ')(\/)?$');
      notCurrent = request.url.replace(reCurrent, background + '$2');
      reqNotCurrent = new Request(notCurrent, {
        mode: 'no-cors'
      });

      toolbox.cacheOnly(reqNotCurrent).then(function (response) {
        if (!response) {
          if (options.debug) {
            console.log('[sw backgrounds] precaching:', notCurrent);
          }
          toolbox.cache(reqNotCurrent.clone(), options);
        }
      });
    }
  });

  return toolbox.fastest(request, values, options);
}

/**
 * Cache background images for the app
 */
module.exports = function backgroundHandler (payload) {
  var backgroundStore = payload.BackgroundStore;

  if (toolbox.options.debug) {
    console.log('[sw backgrounds] install background handling', backgroundStore);
  }

  // Install a precaching, read-thru cache on all requests to the background image service
  toolbox.router.get('*',
    precacheBackgrounds.bind(this, backgroundStore.backgroundUrls), {
    debug: toolbox.options.debug,
    origin: urlm.getHostname(backgroundStore.imageServiceUrl)
  });

  // Nothing deferred, so return placeholder Promise
  return new Promise(function (resolve, reject) {
    resolve();
  });
};
