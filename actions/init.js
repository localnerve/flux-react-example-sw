/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Example:InitAction');

/**
 * Perform the init action.
 * The init action is intended for perparing the app state on the server.
 * Extensible - Many different properties can be passed to the app on this action.
 *   Stores that listen to this action check for properties they are interested in.
 *
 * @param {Object} context - The fluxible action context.
 * @param {Object} payload - The INIT_APP action payload.
 * @param {Function} done - The callback to execute on completion.
 */
function init (context, payload, done) {
  debug('dispatching INIT_APP', payload);
  context.dispatch('INIT_APP', payload);
  done();
}

module.exports = init;
