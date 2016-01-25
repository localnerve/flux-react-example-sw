/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global Promise */
'use strict';

/**
 * Create the pushManager in registration for self.
 *
 * @param {Object} options - creation options.
 * @param {Boolean} options.subReject - pushManager.getSubscription should reject.
 * @param {Boolean} options.subscribed - pushManager.getSubscription should resolve to true.
 */
function createPushManager (options) {
  return {
    getSubscription: function () {
      if (options.subReject) {
        return Promise.reject(new Error('mock error'));
      }

      return Promise.resolve(options.subscribed ||
        typeof options.subscribed === 'undefined');
    }
  };
}

/**
 * Construct a self mock.
 */
function Self () {
  this.teardownReg = this.teardownSelf = this.teardownPush = false;
}
Self.prototype = {
  /**
   * Setup the self mock.
   *
   * @param {Object} options - Setup options.
   * @param {Object} options.pushManager - options to create a pushManager.
   */
  setup: function (options) {
    options = options || {};

    if (global.self) {
      global.self.registration = global.self.registration ||
        (this.teardownReg = true, {});

      if (options.pushManager && !global.self.registration.pushManager) {
        this.teardownPush = true;
        global.self.registration.pushManager = createPushManager(
          options.pushManager
        );
      }
    } else {
      this.teardownSelf = true;
      global.self = {};
      global.self.registration = {};

      if (options.pushManager) {
        global.self.registration.pushManager = createPushManager(
          options.pushManager
        );
      }
    }
  },
  teardown: function () {
    if (this.teardownSelf) {
      delete global.self;
    } else {
      if (this.teardownReg) {
        delete global.self.registration;
      } else if (this.teardownPush) {
        delete global.self.registration.pushManager;
      }
    }
  }
};

module.exports = Self;
