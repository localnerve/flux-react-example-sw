/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global Promise */
'use strict';

var debug = require('debug')('Example:ModalAction');
var createFluxibleRouteTransformer = require('../utils').createFluxibleRouteTransformer;

/**
 * Execute an optional custom action that may be defined for the dialog.
 *
 * @param {Object} context - The fluxible action context.
 * @param {Object} payload - The MODAL action payload.
 * @param {Object} [payload.action] - A custom action for the modal.
 * @param {String} [payload.split] - A code split handler.
 * @returns {Promise} A promise result.
 */
function executeCustomAction (context, payload) {
  var splits = require('../utils/splits');

  if (payload.action) {
    debug('executing custom action ', payload.action);

    // If the payload also indicates a code split, resolve that first.
    var codeResolver = payload.split ? splits[payload.split]
      : function () {
        return Promise.resolve();
      };

    return codeResolver(context, payload, updateComponent).then(function () {
      var transformer = createFluxibleRouteTransformer({
        actions: require('./interface')
      }).jsonToFluxible;

      // Make the action executable
      payload = transformer({
        payload: payload
      }).payload;

      return context.executeAction(payload.action);
    });
  }

  return Promise.resolve();
}

/**
 * Open a modal dialog.
 * Try to get the dialog content from the contentStore first.
 * After content, execute a custom action if one is specified.
 *
 * @param {Object} context - The fluxible action context.
 * @param {Object} payload - The MODAL action payload.
 * @param {Function} done - The callback to execute on completion.
 */
function openModal (context, payload, done) {
  var data = context.getStore('ContentStore').get(payload.resource);

  debug(payload.resource + (data ? ' found ' : ' not found ') + ' in cache');

  context.dispatch('MODAL_START', {
    component: payload.component,
    props: data
  });

  if (!data) {
    context.service.read('page', payload, {}, function (err, data) {
      debug('Page service request complete');

      if (err) {
        context.dispatch('MODAL_FAILURE', err);
        return done(err);
      }

      if (!data) {
        err = new Error('No data found for '+payload.resource);
        context.dispatch('MODAL_FAILURE', err);
        return done(err);
      }

      context.dispatch('RECEIVE_PAGE_CONTENT', {
        resource: payload.resource,
        data: data
      });

      executeCustomAction(context, payload)
      .then(function () {
        done();
      })
      .catch(function (error) {
        context.dispatch('MODAL_FAILURE', error);
        done(error);
      });
    });
  } else {
    executeCustomAction(context, payload)
    .then(function () {
      done();
    })
    .catch(function (error) {
      context.dispatch('MODAL_FAILURE', error);
      done();
    });
  }
}

/**
 * Close the modal dialog.
 *
 * @param {Object} context - The fluxible action context.
 * @param {Object} payload - Ignored.
 * @param {Function} done - The callback to execute on completion.
 */
function closeModal (context, payload, done) {
  context.dispatch('MODAL_STOP');
  done();
}

/**
 * Update the modal UI component.
 *
 * @param {Object} context - The fluxible action context.
 * @param {Object} payload - The MODAL_COMPONENT action payload.
 * @param {String} payload.resource - The name of the component resource.
 * @param {Object} payload.component - The UI component reference.
 * @param {Function} done - The callback to execute on completion.
 */
function updateComponent (context, payload, done) {
  context.dispatch('MODAL_COMPONENT', payload);
  done();
}

module.exports = {
  openModal: openModal,
  closeModal: closeModal,
  updateComponent: updateComponent
};
