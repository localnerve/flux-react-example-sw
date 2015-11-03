/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global Promise, describe, it, before, after, beforeEach */
'use strict';

var expect = require('chai').expect;

var testDom = require('../../utils/testdom');
var createMockActionContext = require('fluxible/utils').createMockActionContext;
var SettingsStore = require('../../../stores/SettingsStore');
var settingsAction = require('../../../actions/settings');

describe('settings action', function () {
  var context, params = {};

  before(function () {
    testDom.start();
  });

  after(function () {
    testDom.stop();
  });

  beforeEach(function () {
    context = createMockActionContext({
      stores: [ SettingsStore ]
    });
  });

  function getSettingsFields () {
    var settingsStore = context.getStore(SettingsStore);
    return {
      hasServiceWorker: settingsStore.getHasServiceWorker(),
      hasPushMessaging: settingsStore.getHasPushMessaging(),
      hasPermissions: settingsStore.getHasPermissions(),
      hasNotifications: settingsStore.getHasNotifications(),
      pushBlocked: settingsStore.getPushBlocked(),
      syncBlocked: settingsStore.getSyncBlocked(),
      pushSubscription: settingsStore.getPushSubscription(),
      pushSubscriptionError: settingsStore.getPushSubscriptionError(),
      pushTopics: settingsStore.getPushTopics(),
      pushTopicsError: settingsStore.getPushTopicsError(),
      transition: settingsStore.getTransition()
    };
  }

  it('baseline jsdom environment settings', function (done) {
    context.executeAction(settingsAction, params, function (err) {
      if (err) {
        return done(err);
      }

      var fields = getSettingsFields();

      expect(fields.hasServiceWorker).to.equal(false);
      expect(fields.hasPushMessaging).to.equal(false);
      expect(fields.hasPermissions).to.equal(false);
      expect(fields.hasNotifications).to.equal(false);
      expect(fields.pushBlocked).to.equal(false);
      expect(fields.syncBlocked).to.equal(false);
      expect(fields.pushSubscription).to.be.null;
      expect(fields.pushSubscriptionError).to.be.null;
      expect(fields.pushTopics).to.be.null;
      expect(fields.pushTopicsError).to.be.null;
      expect(fields.transition).to.be.an('object').that.is.empty;

      done();
    });
  });

  describe('mock serviceWorker', function () {
    before(function () {
      global.navigator.serviceWorker = {};
    });

    after(function () {
      delete global.navigator.serviceWorker;
    });

    it('should update the SettingsStore', function (done) {
      context.executeAction(settingsAction, params, function (err) {
        if (err) {
          return done(err);
        }

        var fields = getSettingsFields();

        expect(fields.hasServiceWorker).to.equal(true);
        expect(fields.hasPushMessaging).to.equal(false);
        expect(fields.hasPermissions).to.equal(false);
        expect(fields.hasNotifications).to.equal(false);
        expect(fields.pushBlocked).to.equal(true);
        expect(fields.syncBlocked).to.equal(true);
        expect(fields.pushSubscription).to.be.null;
        expect(fields.pushSubscriptionError).to.be.null;
        expect(fields.pushTopics).to.be.null;
        expect(fields.pushTopicsError).to.be.null;
        expect(fields.transition).to.be.an('object').that.is.empty;

        done();
      });
    });
  });

  describe('permissions', function () {
    var permissionState = {};

    before(function () {
      global.navigator.serviceWorker = {};
    });

    after(function () {
      delete global.navigator.permissions;
      delete global.navigator.serviceWorker;
    });

    function resolvePermissionState (state) {
      return {
        query: function () {
          return new Promise(function (resolve) {
            permissionState.state = state;
            resolve(permissionState);
          });
        }
      };
    }

    function rejectPermissionState () {
      return {
        query: function () {
          return new Promise(function (resolve, reject) {
            reject(new Error('mock'));
          });
        }
      };
    }

    describe('resolve', function () {
      it('should properly reflect granted', function (done) {
        global.navigator.permissions = resolvePermissionState('granted');

        context.executeAction(settingsAction, params, function (err) {
          if (err) {
            return done(err);
          }

          var fields = getSettingsFields();
          expect(fields.hasPermissions).to.equal(true);
          expect(fields.pushBlocked).to.equal(false);
          done();
        });
      });

      it('should properly reflect denied', function (done) {
        global.navigator.permissions = resolvePermissionState('denied');

        context.executeAction(settingsAction, params, function (err) {
          if (err) {
            return done(err);
          }

          var fields = getSettingsFields();
          expect(fields.hasPermissions).to.equal(true);
          expect(fields.pushBlocked).to.equal(true);
          done();
        });
      });

      it('should handle onchange', function (done) {
        global.navigator.permissions = resolvePermissionState('granted');

        context.executeAction(settingsAction, params, function (err) {
          if (err) {
            return done(err);
          }

          var fields = getSettingsFields();
          expect(fields.hasPermissions).to.equal(true);
          expect(fields.pushBlocked).to.equal(false);

          // change the state and invoke change handler.
          permissionState.state = 'denied';
          permissionState.onchange();

          fields = getSettingsFields();
          expect(fields.pushBlocked).to.equal(true);

          done();
        });
      });
    });

    describe('reject', function () {
      it('should properly handle rejected permission promise', function (done) {
        var settingsStore = context.getStore(SettingsStore),
            pushBlocked = settingsStore.getPushBlocked();

        global.navigator.permissions = rejectPermissionState();

        context.executeAction(settingsAction, params, function (err) {
          if (err) {
            return done(err);
          }

          var fields = getSettingsFields();

          expect(fields.hasPermissions).to.equal(true);

          // should be unchanged
          expect(fields.pushBlocked).to.equal(pushBlocked);
          done();
        });
      });
    });
  });

  describe('notifications', function () {
    before(function () {
      global.navigator.serviceWorker = {};
    });

    after(function () {
      delete global.window.Notification;
      delete global.navigator.serviceWorker;
    });

    it('should properly reflect granted', function (done) {
      global.window.Notification = {
        permission: 'granted'
      };

      context.executeAction(settingsAction, params, function (err) {
        if (err) {
          return done(err);
        }

        var fields = getSettingsFields();

        expect(fields.hasNotifications).to.equal(true);
        expect(fields.pushBlocked).to.equal(false);
        done();
      });
    });

    it('should properly reflect denied', function (done) {
      global.window.Notification = {
        permission: 'denied'
      };

      context.executeAction(settingsAction, params, function (err) {
        if (err) {
          return done(err);
        }

        var fields = getSettingsFields();

        expect(fields.hasNotifications).to.equal(true);
        expect(fields.pushBlocked).to.equal(true);
        done();
      });
    });
  });

  describe('push manager', function () {
    var subscription = { foo: 'bar' };

    before(function () {
      global.navigator.serviceWorker = {};
      global.window.PushManager = {};
    });

    after(function () {
      delete global.window.PushManager;
      delete global.navigator.serviceWorker;
    });

    beforeEach(function () {
      // prevent a topics call
      var settingsStore = context.getStore(SettingsStore);
      settingsStore.updateSettingsState({
        pushTopics: ['mock']
      });
    });

    function resolveReady (value) {
      global.navigator.serviceWorker.ready = Promise.resolve(value);
    }

    function rejectReady (value) {
      global.navigator.serviceWorker.ready = Promise.reject(value);
    }

    function resolveSubscription (value) {
      resolveReady({
        pushManager: {
          getSubscription: function () {
            return Promise.resolve(value);
          }
        }
      });
    }

    function rejectSubscription (value) {
      resolveReady({
        pushManager: {
          getSubscription: function () {
            return Promise.reject(value);
          }
        }
      });
    }

    it('should resolve the push subscription', function (done) {
      // setup subscription delivery
      resolveSubscription(subscription);

      context.executeAction(settingsAction, params, function (err) {
        if (err) {
          return done(err);
        }

        var fields = getSettingsFields();

        expect(fields.pushSubscription).to.eql(subscription);
        done();
      });
    });

    it('should reject the push subscription', function (done) {
      // setup subscription rejection
      rejectSubscription(new Error('mock'));

      context.executeAction(settingsAction, params, function (err) {
        if (err) {
          return done(err);
        }

        var fields = getSettingsFields();

        expect(fields.pushSubscription).to.be.null;
        done();
      });
    });

    it('should properly reflect ready rejection', function (done) {
      // setup ready rejection
      rejectReady(new Error('mock'));

      context.executeAction(settingsAction, params, function (err) {
        if (err) {
          return done(err);
        }

        var fields = getSettingsFields();

        expect(fields.pushSubscription).to.be.null;
        done();
      });
    });
  });
});
