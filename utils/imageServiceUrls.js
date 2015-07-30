/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var urlm = require('./urls');

/**
 * Build a random int in any interval.
 *
 * @param {Number} min - The minimum number in the interval.
 * @param {Number} max - The maximum number in the interval.
 * @returns {Number} A random number in the specified interval.
 */
function randomIntFromInterval (min, max) {
  return Math.floor(Math.random() * (max-min+1) + min);
}

/***
 * A hash of the request builders for each supported image service.
 */
var requestBuildersByService = {
  /**
   * Build a lorempixel request.
   *
   * For lorempixel, the `name` has to be an ordinal between 1 and 9, zero
   * gives you a random image so we avoid that one.
   * So name is resolved:
   * 1. Try to directly use as int, can't be 0
   * 2. Try to use the name before the last dot as int, can't be 0
   * 3. Use random number between 1 and 9
   *
   * @param {Object} options - The options used to build the service url.
   * @param {String} [options.theme] - The image theme, defaults to 'nature'.
   * @param {Number} options.width - The width of the image.
   * @param {Number} options.height - The height of the image.
   * @param {String} options.name - The name of the image to retrieve.
   * @returns {String} The lorempixel request url components.
   */
  lorempixel: function buildLoremPixelRequest (options) {
    var theme = options.theme || 'nature';
    var ordinal =
      parseInt(options.name, 10) ||
      parseInt(urlm.getLastPathSegment(options.name).replace(/\..*$/, ''), 10) ||
      randomIntFromInterval(1, 9);

    ordinal = ordinal % 10;

    // slash at the end avoids a 302 for lorempixel
    return options.width + '/' + options.height + '/' + theme + '/' + ordinal + '/';
  },

  /**
   * Build a firesize request.
   * Only basic options supported, defaults to g_center gravity.
   *
   * @param {Object} options - The options used to build the service url.
   * @param {String} [options.gravity] - The gravity used for firesize.
   * @param {String} options.width - The width of the image.
   * @param {String} options.height - The height of the image.
   * @param {String} options.name - The name of the image to retrieve.
   * @returns {String} A firesize request url.
   */
  firesize: function buildFireSizeRequest (options) {
    var gravity = options.gravity || 'g_center';
    return options.width + 'x' + options.height + '/' + gravity + '/' + options.name;
  }
};

/**
 * Build an image service url.
 * For now, just supports lorempixel, firesize.
 *
 * @param {String} serviceUrl - The protocol and hostname (in url form) of the service.
 * @param {Object} options - The options for the service to build an image service url.
 * For now, just firesize and lorempixel basic options supported.
 * @throws If an unsupported image serviceUrl is supplied.
 * Only lorempixel and firesize are currently supported.
 * @returns {String} An image service url that can be used to retrieve the image.
 */
function buildImageUrl (serviceUrl, options) {
  // remove any trailing slash
  serviceUrl = serviceUrl.replace(/\/$/, '');

  var serviceName = urlm.getSignificantHostname(serviceUrl);

  var requestBuilder = requestBuildersByService[serviceName];
  if (!requestBuilder) {
    throw new Error('Unrecognized service supplied');
  }

  return serviceUrl + '/' + requestBuilder(options);
}

module.exports = buildImageUrl;
