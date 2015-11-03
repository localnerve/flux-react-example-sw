/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, before, after, beforeEach */
'use strict';

var expect = require('chai').expect;

var createMockActionContext = require('fluxible/utils').createMockActionContext;
var MockService = require('fluxible-plugin-fetchr/utils/MockServiceManager');
var SettingsStore = require('../../../stores/SettingsStore');
var subscription = require('../../mocks/subscription');
var pushAction = require('../../../actions/push');

describe('push action', function () {
  var context;

  before(function () {
  });

  after(function () {
  });

  beforeEach(function () {
    context = createMockActionContext({
      stores: [ SettingsStore ]
    });
    context.service = new MockService();
    context.service.setService('subscription', function (method) {
      var args = Array.prototype.slice.call(arguments, 1);
      subscription[method].apply(subscription, args);
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

  it('should get topics', function (done) {
    context.executeAction(pushAction.getTopics, {}, function (err) {
      if (err) {
        return done(err);
      }

      var fields = getSettingsFields();
      expect(fields.pushTopicsError).to.be.null;
      expect(subscription.topics).to.eql(fields.pushTopics);
      done();
    });
  });

  it('should get topics with error', function (done) {
    context.executeAction(pushAction.getTopics, {
      emulateError: true
    }, function (err) {
      var fields = getSettingsFields();
      expect(err).to.be.an('Error');
      expect(fields.pushTopicsError).to.not.be.null;
      done();
    });
  });

  it('should update topics', function (done) {
    var updates = subscription.updateTopic;
    context.executeAction(pushAction.updateTopics, {
      topics: updates
    }, function (err) {
      if (err) {
        return done(err);
      }

      var fields = getSettingsFields();

      expect(fields.pushTopics).to.eql(updates);
      expect(fields.pushTopicsError).to.be.null;

      done();
    });
  });

  it('should update topics with error', function (done) {
    context.executeAction(pushAction.updateTopics, {
      emulateError: true
    }, function (err) {
      var fields = getSettingsFields();
      expect(err).to.be.an('Error');
      expect(fields.pushTopicsError).to.not.be.null;
      done();
    });
  });

  it.skip('should create a subscription', function () {
  });

  it.skip('should delete a subscription', function () {
  });
});
