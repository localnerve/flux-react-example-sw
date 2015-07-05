/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

function buildLoremPixelUrl (service, width, height, name) {
  var theme = 'nature', offset = 3;
  var ordinal = parseInt(name, 10) || 0;

  // the slash at the end avoids a 302
  return (service || 'http://lorempixel.com') +
    '/' + width + '/' + height + '/' + theme + '/' +
    ((ordinal + offset) % 10) + '/';
}

function buildFireSizeUrl (service, width, height, name) {
  return service + '/' + width + 'x' + height + '/g_center/' +
    buildLoremPixelUrl(null, width, height, name);
}

// for now, just supports lorempixel, fastly
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
