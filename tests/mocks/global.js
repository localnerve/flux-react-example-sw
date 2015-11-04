/**
 * Copyright 2015, Alex Grant, LocalNerve, LLC.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Global mocks (on window, navigator, etc) for service worker push notification support.
 */
/* global Promise */
'use strict';

/**
 * Setup the global permissions text fixture.
 *
 * @param {Object} options - Permissions setup options.
 * @param {String} [options.state] - The state to resolve to.
 * @param {Boolean} [options.rejectQuery] - Reject the permissions query.
 */
function setupPermissions (options) {
  options = options || {};

  var permissions = {};

  global.navigator.permissions = {
    query: function () {
      return new Promise(function (resolve, reject) {
        permissions.state = options.state;
        if (options.rejectQuery) {
          return reject(new Error('mock'));
        }
        return resolve(permissions);
      });
    }
  };

  return permissions;
}

/**
 * Setup the global serviceWorker pushManager test fixture.
 *
 * @param {Object} options - Push Manager setup options
 * @param {Boolean} [options.succeedUnsub] - succeed the unsubscribe.
 * @param {Boolean} [options.rejectUnsub] - reject the unsubscribe.
 * @param {Boolean} [options.rejectSubcribe] - reject the subscribe.
 * @param {Boolean} [options.rejectGetSub] - reject the getSubscription.
 */
function setupPushManager (options) {
  options = options || {};

  var subscription = {
    endpoint: 'http://service.dom/push/123456789',
    unsubscribe: function () {
      if (options.rejectUnsub) {
        return Promise.reject(new Error('mock unsub'));
      }
      return Promise.resolve(options.succeedUnsub);
    }
  };

  global.navigator.serviceWorker = {
    ready: Promise.resolve({
      pushManager: {
        subscribe: function () {
          if (options.rejectSubcribe) {
            return Promise.reject(new Error('mock sub'));
          }
          return Promise.resolve(subscription);
        },
        getSubscription: function () {
          if (options.rejectGetSub) {
            return Promise.reject(new Error('mock getSub'));
          }
          return Promise.resolve(subscription);
        }
      }
    })
  };

  return subscription;
}

module.exports = {
  setupPushManager: setupPushManager,
  setupPermissions: setupPermissions
};
