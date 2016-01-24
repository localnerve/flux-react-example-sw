/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Example:SizeAction');

/**
 * The size action.
 * Just dispatches the UPDATE_SIZE action with the given payload.
 *
 * @param {Object} context - The fluxible action context.
 * @param {Object} payload - The UPDATE_SIZE action payload.
 * @param {Function} done - The callback to execute on action completion.
 */
function updateSize (context, payload, done) {
  debug('dispatching UPDATE_SIZE', payload);
  context.dispatch('UPDATE_SIZE', payload);
  done();
}

module.exports = updateSize;
