/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

/**
 * Build a lorempixel url.
 *
 * @param {String} [service] - The protocol and hostname of the service.
 * @param {String} width - The width of the image.
 * @param {String} height - The height of the image.
 * @param {String} name - The name of the image to retrieve.
 * @returns {String} A lorempixel request url.
 */
function buildLoremPixelUrl (service, width, height, name) {
  var theme = 'nature', offset = 0;
  var ordinal = parseInt(name, 10) || 0;

  // slash at the end avoids a 302 for lorempixel
  return (service || 'http://lorempixel.com') +
    '/' + width + '/' + height + '/' + theme + '/' +
    ((ordinal + offset) % 10) + '/';
}

/**
 * Build a firesize url.
 *
 * @param {String} service - The protocol and hostname of the service.
 * @param {String} width - The width of the image.
 * @param {String} height - The height of the image.
 * @param {String} name - The name of the image to retrieve.
 * @returns {String} A firesize request url.
 */
function buildFireSizeUrl (service, width, height, name) {
  return service + '/' + width + 'x' + height + '/g_center/' +
    buildLoremPixelUrl(null, width, height, name);
}

/**
 * Build an image service url.
 * For now, just supports lorempixel, firesize.
 *
 * @param {String} service - The protocol and hostname of the service.
 * @param {String} width - The width of the image.
 * @param {String} height - The height of the image.
 * @param {String} name - The name of the image to retrieve.
 * @returns {String} An image service url.
 */
function buildImageUrl (service, width, height, name) {
  var url;

  if (/lorem/i.test(service)) {
    url = buildLoremPixelUrl(service, width, height, name);
  } else {
    url = buildFireSizeUrl(service, width, height, name);
  }

  return url;
}

module.exports = buildImageUrl;
