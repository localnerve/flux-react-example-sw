/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * TODO: finish...
 */
/* global window */
'use strict';

var debug = require('debug')('Example:PushAction');
var getSubscriptionId = require('../utils').getSubscriptionId;

/**
 * The send push action.
 * This is for in-app demonstration only.
 *
 * @param {Object} context - The fluxible action context.
 * @param {Object} payload - The action payload.
 * @param {Object} payload.subscription - The push subscription.
 * @param {Function} done - The callback to execute on action completion.
 */
function demoSend (context, payload, done) {
  debug('performing demo send push notification', payload);

  context.service.create('push', {
    subscriptionId: getSubscriptionId(payload.subscription),
    endpoint: payload.subscription.endpoint
  }, {}, {}, function (err) {
    debug('completed push', err);
    if (err) {
      return done(err);
    }
    return done();
  });
}

/**
 * Subscribe to push notifications.
 *
 * @param {Object} context - The fluxible action context.
 * @param {Object} payload - ignored.
 * @param {Function} done - The callback to execute on action completion.
 */
function subscribe (context, payload, done) {
  debug('subscribing to push notifications');

  window.navigator.serviceWorker.ready.then(function (registration) {
    registration.pushManager.subscribe({ userVisibleOnly: true })
    .then(function (subscription) {
      var subscriptionId = getSubscriptionId(subscription);

      // Subscribe to topics
      context.service.create('subscription', {
        subscriptionId: subscriptionId,
        endpoint: subscription.endpoint
      }, {}, {}, function (err, data) {
        debug('completed push notification subscribe', err, data);

        if (err) {
          return done(err);
        }

        // Update settings
        context.dispatch('SETTINGS_STATE', {
          pushTopics: data,
          pushSubscription: subscription
        });

        return done();
      });
    }).catch(function (error) {
      // TODO: finish

      var settingsStore = context.getStore('SettingsStore'),
          hasPermissions = settingsStore.getHasPermissions();

      if (hasPermissions) {
        window.navigator.permissions.query({
          name: 'push',
          userVisibleOnly: true
        }).then(function (permissionState) {
          debug('subscribe error', error, ' push permissions state ', permissionState);
        }).catch(function (error2) {
          debug('subscribe error', error, ' permissions error ', error2);
        }).then(function () {
          done(error);
        });
      } else {
        debug('subscribe error', error);
        debug('hasNotifications', settingsStore.getHasNotifications());
        debug('subscribe error', error, ' Notification permission ', window.Notification.permission);
        done(error);
      }
    });
  });
}

/**
 * Unsubscribe from push notifications.
 *
 * @param {Object} context - The fluxible action context.
 * @param {Object} payload - ignored.
 * @param {Function} done - The callback to execute on action completion.
 */
function unsubscribe (context, payload, done) {
  debug('unsubscribing from push notifications', payload);

  window.navigator.serviceWorker.ready.then(function (registration) {
    registration.pushManager.getSubscription().then(function (pushSubscription) {
      var settingsStore = context.getStore('SettingsStore'),
          subscription = pushSubscription || settingsStore.getPushSubscription();

      debug('unsubscribe', subscription);

      if (!subscription) {
        return done(new Error('unsubscribe failed: Could not find subscription'));
      }

      var subscriptionId = getSubscriptionId(subscription);

      subscription.unsubscribe().then(function (successful) {
        debug('unsubscribed from browser', successful);
      }).catch(function (error) {
        debug('failed to unsubscribe from browser', error);
      });

      context.service.delete('subscription', {
        subscriptionId: subscriptionId
      }, {}, function (err) {
        debug('completed push notification unsubscribe', err);

        if (err) {
          return done(err);
        }

        context.dispatch('SETTINGS_STATE', {
          pushTopics: null,
          pushSubscription: null
        });

        return done();
      });
    });
  });
}

/**
 * Get push notification topics.
 *
 * @param {Object} context - The fluxible action context.
 * @param {Object} payload - The action payload.
 * @param {Function} done - The callback to execute on action completion.
 */
function getTopics (context, payload, done) {
  debug('reading push notification topics', payload);

  context.service.read('subscription', payload, {}, function (err, data) {
    debug('completed push notification topics read', err, data);

    if (err) {
      return done(err);
    }

    context.dispatch('SETTINGS_STATE', {
      pushTopics: data
    });

    return done();
  });
}

/**
 * Update push notifications subscribed topics.
 *
 * @param {Object} context - The fluxible action context.
 * @param {Object} payload - The action payload.
 * @param {Function} done - The callback to execute on action completion.
 */
function updateTopics (context, payload, done) {
  debug('updating push notification topics', payload);

  context.service.update('subscription', {
    subscriptionId: payload.subscriptionId,
    endpoint: payload.endpoint
  }, {
    topics: payload.topics
  }, {}, function (err, data) {
    debug('completed push notification topic update', err, data);

    if (err) {
      return done(err);
    }

    context.dispatch('SETTINGS_STATE', {
      pushTopics: data
    });

    return done();
  });
}

module.exports = {
  demoSend: demoSend,
  subscribe: subscribe,
  unsubscribe: unsubscribe,
  getTopics: getTopics,
  updateTopics: updateTopics
};
