/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global process, window */
'use strict';

var debug = require('debug')('Example:PushAction');
var getSubscriptionId = require('../utils/push').getSubscriptionId;
var syncable = require('../utils/syncable');
var messages = require('../utils/messages');
var __DEV__ = process.env.NODE_ENV !== 'production';

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

  var subscriptionId = getSubscriptionId(payload.subscription);

  context.service.create('push', syncable.push({
    subscriptionId: subscriptionId,
    endpoint: payload.subscription.endpoint
  }, subscriptionId, syncable.ops.demo), {}, {}, function (err) {
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
 * @param {Object} payload - ignored, except for testing.
 * @param {Function} done - The callback to execute on action completion.
 */
function subscribe (context, payload, done) {
  debug('subscribing to push notifications');

  context.dispatch('SETTINGS_TRANSITION', {
    pushSubscription: true
  });

  /**
   * complete subscribe.
   */
  function complete (error, subscription, topics) {
    debug('subscribe complete', error, subscription, topics);

    context.dispatch('SETTINGS_STATE', {
      pushTopics: error ? null : topics,
      pushSubscription: subscription,
      pushSubscriptionError: error
    });

    return done(error);
  }

  window.navigator.serviceWorker.ready.then(function (registration) {
    registration.pushManager.subscribe({ userVisibleOnly: true })
    .then(function (subscription) {
      debug('browser subscribed', subscription);

      var params = {
        subscriptionId: getSubscriptionId(subscription),
        endpoint: subscription.endpoint
      };

      if (__DEV__) {
        params.emulateError = payload && payload.emulateError;
      }

      return messages.workerSendMessage({
        command: 'pushSync',
        payload: {
          subscriptionId: params.subscriptionId
        }
      })
      .then(function () {
        context.service.create('subscription',
          syncable.push(params, params.subscriptionId, syncable.ops.subscribe),
          {}, {}, function (err, data) {
          if (err) {
            messages.workerSendMessage({
              command: 'pushSync',
              payload: {
                subscriptionId: false
              }
            });
          }
          complete(err, subscription, data);
        });
      })
      .catch(function (error) {
        debug('pushSync message failed ', error);
        complete(error, null, null);
      });
    })
    .catch(function (error) {
      var settingsStore = context.getStore('SettingsStore'),
          hasPermissions = settingsStore.getHasPermissions();

      if (hasPermissions) {
        window.navigator.permissions.query({
          name: 'push',
          userVisibleOnly: true
        })
        .then(function (permissionState) {
          debug('subscribe error', error, ' push permissions state ', permissionState);
          if (permissionState.state === 'prompt') {
            error = new Error('Must accept the permission prompt');
          } else if (permissionState.state === 'denied') {
            error = new Error('User blocked notifications');
          }
        })
        .catch(function (error2) {
          debug('subscribe error', error, ' permissions error ', error2);
        })
        .then(function () {
          complete(error, null, null);
        });
      } else {
        debug('subscribe error', error);
        debug('hasNotifications', settingsStore.getHasNotifications());

        if (settingsStore.getHasNotifications()) {
          debug('subscribe error', error, ' Notification permission ', window.Notification.permission);
        }

        complete(error, null, null);
      }
    });
  });
}

/**
 * Unsubscribe from push notifications.
 *
 * @param {Object} context - The fluxible action context.
 * @param {Object} payload - ignored, except for testing.
 * @param {Function} done - The callback to execute on action completion.
 */
function unsubscribe (context, payload, done) {
  debug('unsubscribing from push notifications', payload);

  context.dispatch('SETTINGS_TRANSITION', {
    pushSubscription: true
  });

  /**
   * complete unsubscribe
   */
  function complete (error) {
    debug('unsubscribe complete', error);

    var params = {
      pushSubscriptionError: error
    };

    if (!error) {
      params.pushSubscription = null;
      params.pushTopics = null;
    }

    context.dispatch('SETTINGS_STATE', params);
    return done(error);
  }

  window.navigator.serviceWorker.ready.then(function (registration) {
    registration.pushManager.getSubscription().then(function (pushSubscription) {
      debug('got push subscription', pushSubscription);

      var subscription = pushSubscription ||
        context.getStore('SettingsStore').getPushSubscription();

      debug('subscription to unsubscribe', subscription);

      if (!subscription) {
        return complete(new Error('Subscription not found'));
      }

      subscription.unsubscribe().then(function (successful) {
        debug('unsubscribed from browser, success: ', successful);

        if (!successful) {
          return complete(new Error('Unsubscribe unsuccessful'));
        }

        var params = {
          subscriptionId: getSubscriptionId(subscription)
        };

        if (__DEV__) {
          params.emulateError = payload && payload.emulateError;
        }

        return messages.workerSendMessage({
          command: 'pushSync',
          payload: {
            subscriptionId: false
          }
        })
        .then(function () {
          context.service.delete('subscription',
            syncable.push(
              params,
              params.subscriptionId,
              syncable.ops.unsubscribe
            ), {}, function (err) {
              if (err) {
                // Restore the subscription
                messages.workerSendMessage({
                  command: 'pushSync',
                  payload: {
                    subscriptionId: params.subscriptionId
                  }
                });
              }
              complete(err);
            }
          );
        })
        .catch(function (error) {
          debug('pushSync message failed ', error);
          error.message = 'pushSync message failed: ' + error.message;
          complete(error);
        });
      })
      .catch(function (error) {
        error.message = 'Unsubscribe failed: ' + error.message;
        complete(error);
      });
    })
    .catch(function (error) {
      error.message = 'getSubscription failed: ' + error.message;
      complete(error);
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

  context.dispatch('SETTINGS_TRANSITION', {
    pushTopics: true
  });

  context.service.read('subscription', payload, {}, function (err, data) {
    debug('completed push notification topics read', err, data);

    var state = {
      pushTopicsError: err
    };

    if (!err) {
      state.pushTopics = data;
    }

    context.dispatch('SETTINGS_STATE', state);

    return done(err);
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

  context.dispatch('SETTINGS_TRANSITION', {
    pushTopics: true
  });

  // move the topics to the POST body
  var body = {
    topics: payload.topics
  };
  delete payload.topics;

  context.service.update('subscription',
    syncable.push(payload, payload.subscriptionId, syncable.ops.updateTopics),
    body,
    {},
    function (err, data) {
      debug('completed push notification topic update', err, data);

      var state = {
        pushTopicsError: err
      };

      if (!err) {
        state.pushTopics = data;
      }

      context.dispatch('SETTINGS_STATE', state);

      return done(err);
    }
  );
}

module.exports = {
  demoSend: demoSend,
  subscribe: subscribe,
  unsubscribe: unsubscribe,
  getTopics: getTopics,
  updateTopics: updateTopics
};
