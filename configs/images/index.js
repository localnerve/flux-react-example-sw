/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Environment specific configuration for images.
 *
 * Environment variables can override the following:
 *   IMAGE_SERVICE_URL - A string that denotes an image service, default lorempixel
 */
'use strict';

// For now, just supporting firesize, lorempixel by default
function IMAGE_SERVICE_URL () {
  return process.env.IMAGE_SERVICE_URL || process.env.FIRESIZE_URL || 'http://lorempixel.com';
}

function makeConfig () {
  return {
    service: {
      url: IMAGE_SERVICE_URL
    }
  };
}

module.exports = makeConfig;
