/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Example:BackgroundsAction');

function background (context, payload, done) {
  debug('dispatching INIT_BACKGROUNDS', payload);

  context.dispatch('INIT_BACKGROUNDS', payload);
  done();
}

module.exports = background;
