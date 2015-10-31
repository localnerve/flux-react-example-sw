/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, before, after, beforeEach */
'use strict';

var expect = require('chai').expect;

var testDom = require('../../utils/testdom');
var createMockActionContext = require('fluxible/utils').createMockActionContext;
var SettingsStore = require('../../../stores/SettingsStore');
var settingsAction = require('../../../actions/settings');

describe('settings action', function () {
  var context, params = { subscription: null };

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
      pushTopics: settingsStore.getPushTopics()
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
      expect(fields.pushTopics).to.be.null;

      done();
    });
  });

  describe('mock serviceWorker', function () {
    before(function () {
      global.navigator.serviceWorker = {};
    });

    after(function () {
      global.navigator.serviceWorker = null;
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
        expect(fields.pushTopics).to.be.null;

        done();
      });
    });
  });
});
