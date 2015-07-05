/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Example:SizeAction');

function updateSize (context, payload, done) {
  debug('dispatching UPDATE_SIZE', payload);

  context.dispatch('UPDATE_SIZE', payload);
  done();
}

module.exports = updateSize;
