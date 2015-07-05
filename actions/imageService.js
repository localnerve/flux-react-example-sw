/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Example:ImageServiceAction');

function imageService (context, payload, done) {
  debug('dispatching INIT_IMAGE_SERVICE', payload);

  context.dispatch('INIT_IMAGE_SERVICE', payload);
  done();
}

module.exports = imageService;
