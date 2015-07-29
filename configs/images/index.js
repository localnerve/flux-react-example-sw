/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Environment specific configuration for images.
 *
 * Environment variables can override the following:
 *   IMAGE_SERVICE_URL - A string that denotes an image service, default lorempixel
 */
'use strict';

/**
 * Get the IMAGE_SERVICE_URL configuration value.
 * Defaults to FIRESIZE_URL or lorempixel if FIRESIZE_URL is not defined.
 *
 * @returns {String} The IMAGE_SERVICE_URL configuration value.
 */
function IMAGE_SERVICE_URL () {
  return process.env.IMAGE_SERVICE_URL || process.env.FIRESIZE_URL || 'http://lorempixel.com';
}

/**
 * Make the images configuration object.
 *
 * @returns the images configuration object.
 */
function makeConfig () {
  return {
    service: {
      url: IMAGE_SERVICE_URL
    }
  };
}

module.exports = makeConfig;
