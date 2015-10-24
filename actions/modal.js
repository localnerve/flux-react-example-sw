/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Example:ModalAction');

/**
 * Perform the START_MODAL action.
 *
 * @param {Object} context - The fluxible action context.
 * @param {Object} payload - The MODAL action payload.
 * @param {Function} done - The callback to execute on completion.
 */
function startModal (context, payload, done) {
  var data = context.getStore('ContentStore').get(payload.resource);

  if (data) {
    debug('Found '+payload.resource+' in cache');

    context.dispatch('START_MODAL', {
      component: payload.component,
      props: data
    });

    return done();
  }

  context.service.read('page', payload, {}, function (err, data) {
    debug('Page service request complete');

    if (err) {
      return done(err);
    }
    // check data here, but what is the proper error outcome?

    context.dispatch('RECEIVE_PAGE_CONTENT', {
      resource: payload.resource,
      data: data
    });

    context.dispatch('START_MODAL', {
      component: payload.component,
      props: data
    });

    return done();
  });
}

/**
 * Perform the STOP_MODAL action.
 */
function stopModal (context, payload, done) {
  context.dispatch('STOP_MODAL');
  done();
}

module.exports = {
  startModal: startModal,
  stopModal: stopModal
};
