/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Updates the settings store.
 */
/* global window, Promise */
'use strict';

var debug = require('debug')('Example:SettingsAction');
var getSubscriptionId = require('../utils/push').getSubscriptionId;
var getTopics = require('./push').getTopics;

/**
 * Get the background sync permissions.
 */
function syncPermission (state) {
  // For now, just disable.
  state.syncBlocked = true;
}
/**
 * Get the push subscription.
 *
 * @param {Object} state - The push state object.
 * @returns {Promise} A promise that resolves when subscription has been updated
 * in state.
 */
function getPushSubscription (state) {
  if (state.hasPushMessaging) {
    return window.navigator.serviceWorker.ready.then(function (registration) {
      return registration.pushManager.getSubscription()
      .then(function (subscription) {
        state.pushSubscription = subscription;
      })
      .catch(function (error) {
        debug('error getting push subscription', error);
        state.pushSubscription = null;
      });
    });
    // No need to handle reject, because this will only execute in a secure context.
    // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/#navigator-service-worker-ready
  }
  state.pushSubscription = null;
  return Promise.resolve();
}

/**
 * Get push permissions.
 *
 * @param {Object} state - the state object to populate.
 * @param {Object} context - the fluxible action context.
 * @returns {Promise} A promise that fulfills when the state is updated.
 */
function pushPermission (state, context) {
  return window.navigator.permissions.query({
    name: 'push',
    userVisibleOnly: true
  }).then(function (permission) {
    state.pushBlocked = permission.state === 'denied';

    /**
     * Assign a push permission change handler.
     */
    permission.onchange = function pushPermissionsChanged () {
      var update = {
        // 'this' refers to this push permission
        pushBlocked: this.state === 'denied'
      };
      context.dispatch('SETTINGS_STATE', update);
    };
  }).catch(function (error) {
    debug('permission query error', error);
  });
}

/**
 * Get window notification permission when permissions API not supported.
 *
 * @param {Object} state - The push state object to popualte.
 * @returns {Promise} A promise that fulfills when the state is updated.
 */
function notificationPermission (state) {
  state.pushBlocked =
    state.hasNotifications ? window.Notification.permission === 'denied'
      : true; // No push possible without permissions.

  return Promise.resolve();
}

/**
 * Perform the SETTINGS_STATE action.
 * Reflects the current service worker
 *  capabilities, permissions, and subscription state.
 *
 * @param {Object} context - The fluxible action context.
 * @param {Object} payload - ignored.
 * @param {Function} done - The callback to execute on completion.
 */
function settingsState (context, payload, done) {
  var state = {
    hasServiceWorker: ('serviceWorker' in window.navigator),
    hasPushMessaging: ('PushManager' in window),
    hasNotifications: ('Notification' in window),
    hasPermissions: ('permissions' in window.navigator)
  };

  if (state.hasServiceWorker) {
    (state.hasPermissions ? pushPermission(state, context)
      : notificationPermission(state))
    .then(function () {
      return getPushSubscription(state);
    })
    .then(function () {
      if (state.pushSubscription) {
        var settingsStore = context.getStore('SettingsStore'),
            pushTopics = settingsStore.getPushTopics();
        if (!pushTopics) {
          return context.executeAction(getTopics, {
            subscriptionId: getSubscriptionId(state.pushSubscription)
          });
        }
      }
    })
    .then(function () {
      return syncPermission(state);
    })
    .then(function () {
      context.dispatch('SETTINGS_STATE', state);
      done();
    });
  } else {
    context.dispatch('SETTINGS_STATE', state);
    done();
  }
}

module.exports = settingsState;
