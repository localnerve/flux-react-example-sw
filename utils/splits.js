/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Staticly define all possible code splits.
 * Split definitions have to be static for webpack to generate bundles.
 */
/* global Promise */
'use strict';

var debug = require('debug')('Example:Splits');
var actionsInterface = require('../actions/interface');
var __DEV__ = process.env.NODE_ENV !== 'production';

/***
 * Add new static split handlers here.
 * These are referenced from backend data to signal a change in the
 * behavior of code.
 */
var splitHandlers = {
  settings: injectSplitSettings
};

// NodeJS does not support CommonJS require.ensure.
// On the server, the code is already here, so why should it?
if (typeof require.ensure !== 'function') {
  /**
   * polyfill require.ensure
   */
  require.ensure = function (deps, cb) {
    cb(require);
  };
}

/**
 * Download the settings code and inject it into the main program.
 * Settings are available only in an on-demand dialog, so it doesn't
 * need to be in the main bundle.
 *
 * download and injection is idempotent, no consequence from re-exec.
 *
 * @param {Object} context - The fluxible action context.
 * @param {Object} payload - The settings payload.
 * @param {Object} payload.action - The settings action definition.
 * @param {String} payload.action.name - The settings action name.
 * @param {String} payload.component - The settings component name.
 * @param {Function} updateAction - The action to execute after load,
 * actions/modal.updateComponent.
 * @returns {Promise} A promise that resolves when the code is downloaded and
 * injected.
 */
function injectSplitSettings (context, payload, updateAction) {
  debug('injectSplitSettings payload', payload);

  return new Promise(function (resolve, reject) {
    try {
      require.ensure([
        '../actions/settings',
        '../components/pages/settings'
      ], function (require) {
        var settings = {
          action: require('../actions/settings'),
          component: require('../components/pages/settings')
        };

        // Inject this action into the actions interface for backend availability.
        actionsInterface[payload.action.name] = settings.action;

        var updatePayload = {
          resource: payload.component,
          component: settings.component
        };

        if (__DEV__) {
          updatePayload.emulateError = payload.emulateError;
        }

        // Settings is a modal component, so give it to the modal store.
        context.executeAction(updateAction, updatePayload, function (err) {
          if (err) {
            debug('updateAction failed', err);
            return reject(err);
          }
          resolve();
        });
      });
    } catch (e) {
      debug('Failed to download/inject settings', e);
      reject(e);
    }
  });
}

module.exports = splitHandlers;
