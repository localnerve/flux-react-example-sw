/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Example:InitAction');

function init (context, payload, done) {
  debug('dispatching INIT_APP', payload);
  context.dispatch('INIT_APP', payload);
  done();
}

module.exports = init;
