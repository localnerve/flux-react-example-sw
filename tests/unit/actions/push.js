/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, before, after, beforeEach */
'use strict';

var expect = require('chai').expect;

var testDom = require('../../utils/testdom');
var setupPushManager = require('../../mocks/global').setupPushManager;
var setupPermissions = require('../../mocks/global').setupPermissions;
var setupNotification = require('../../mocks/global').setupNotification;
var getSettingsFields = require('../../utils/settings').getSettingsFields;
var createMockActionContext = require('fluxible/utils').createMockActionContext;
var MockService = require('fluxible-plugin-fetchr/utils/MockServiceManager');
var SettingsStore = require('../../../stores/SettingsStore');
var subscription = require('../../mocks/subscription');
var pushAction = require('../../../actions/push');

describe('push action', function () {
  var context;

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

  describe('topics', function () {
    it('should get topics', function (done) {
      context.executeAction(pushAction.getTopics, {}, function (err) {
        if (err) {
          return done(err);
        }

        var fields = getSettingsFields(context, SettingsStore);
        expect(fields.pushTopicsError).to.be.null;
        expect(subscription.topics).to.eql(fields.pushTopics);
        done();
      });
    });

    it('should get topics with error', function (done) {
      context.executeAction(pushAction.getTopics, {
        emulateError: true
      }, function (err) {
        var fields = getSettingsFields(context, SettingsStore);
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

        var fields = getSettingsFields(context, SettingsStore);
        expect(fields.pushTopics).to.eql(updates);
        expect(fields.pushTopicsError).to.be.null;
        done();
      });
    });

    it('should update topics with error', function (done) {
      context.executeAction(pushAction.updateTopics, {
        emulateError: true
      }, function (err) {
        var fields = getSettingsFields(context, SettingsStore);
        expect(err).to.be.an('Error');
        expect(fields.pushTopicsError).to.not.be.null;
        done();
      });
    });
  });

  describe('un/subscribe', function () {
    before(function () {
      testDom.start();
    });

    after(function () {
      testDom.stop();
    });

    describe('subscribe', function () {
      it('should create a subscription', function (done) {
        var sub = setupPushManager();

        context.executeAction(pushAction.subscribe, {}, function (err) {
          if (err) {
            return done(err);
          }

          var fields = getSettingsFields(context, SettingsStore);
          expect(fields.pushSubscriptionError).to.be.null;
          expect(fields.pushSubscription).to.eql(sub);
          expect(fields.pushTopics).to.eql(subscription.topics);
          done();
        });
      });

      it('should handle subscription service error', function (done) {
        setupPushManager();

        context.executeAction(pushAction.subscribe, {
          emulateError: true
        }, function (err) {
          var fields = getSettingsFields(context, SettingsStore);
          expect(err).to.be.an('Error');
          expect(fields.pushSubscriptionError).to.not.be.null;
          expect(fields.pushTopics).to.be.null;
          done();
        });
      });

      // I'm not sure this case makes sense.
      it('should handle subscription reject without permissions or notifications', function (done) {
        setupPushManager({
          rejectSubcribe: true
        });

        context.executeAction(pushAction.subscribe, {}, function (err) {
          var fields = getSettingsFields(context, SettingsStore);
          expect(err).to.be.an('Error');
          expect(fields.pushSubscriptionError).to.not.be.null;
          expect(fields.pushSubscription).to.be.null;
          expect(fields.pushTopics).to.be.null;
          done();
        });
      });

      it('should handle subscription reject with notification, denied', function (done) {
        setupPushManager({
          rejectSubcribe: true
        });
        setupNotification({
          permission: 'denied'
        });
        context.getStore(SettingsStore).updateSettingsState({
          hasNotifications: true
        });

        context.executeAction(pushAction.subscribe, {}, function (err) {
          var fields = getSettingsFields(context, SettingsStore);
          expect(err).to.be.an('Error');
          expect(fields.pushSubscriptionError).to.not.be.null;
          expect(fields.pushSubscription).to.be.null;
          expect(fields.pushTopics).to.be.null;
          done();
        });
      });

      it('should handle subscription reject with permissions, prompt', function (done) {
        setupPushManager({
          rejectSubcribe: true
        });
        setupPermissions({
          state: 'prompt'
        });
        context.getStore(SettingsStore).updateSettingsState({
          hasPermissions: true
        });

        context.executeAction(pushAction.subscribe, {}, function (err) {
          var fields = getSettingsFields(context, SettingsStore);
          expect(err).to.be.an('Error');
          expect(fields.pushSubscriptionError).to.not.be.null;
          expect(fields.pushSubscription).to.be.null;
          expect(fields.pushTopics).to.be.null;
          done();
        });
      });

      it('should handle subscription reject with permissions, denied', function (done) {
        setupPushManager({
          rejectSubcribe: true
        });
        setupPermissions({
          state: 'denied'
        });
        context.getStore(SettingsStore).updateSettingsState({
          hasPermissions: true
        });

        context.executeAction(pushAction.subscribe, {}, function (err) {
          var fields = getSettingsFields(context, SettingsStore);
          expect(err).to.be.an('Error');
          expect(fields.pushSubscriptionError).to.not.be.null;
          expect(fields.pushSubscription).to.be.null;
          expect(fields.pushTopics).to.be.null;
          done();
        });
      });

      it('should handle subscription reject with permission reject', function (done) {
        setupPushManager({
          rejectSubcribe: true
        });
        setupPermissions({
          rejectQuery: true
        });
        context.getStore(SettingsStore).updateSettingsState({
          hasPermissions: true
        });

        context.executeAction(pushAction.subscribe, {}, function (err) {
          var fields = getSettingsFields(context, SettingsStore);
          expect(err).to.be.an('Error');
          expect(fields.pushSubscriptionError).to.not.be.null;
          expect(fields.pushSubscription).to.be.null;
          expect(fields.pushTopics).to.be.null;
          done();
        });
      });
    });

    describe('unsubscribe', function () {
      it('should unsubcribe a subscription', function (done) {
        setupPushManager({
          succeedUnsub: true
        });

        context.executeAction(pushAction.unsubscribe, {}, function (err) {
          if (err) {
            return done(err);
          }

          var fields = getSettingsFields(context, SettingsStore);
          expect(fields.pushSubscription).to.be.null;
          expect(fields.pushTopics).to.be.null;
          expect(fields.pushSubscriptionError).to.be.null;
          done();
        });
      });

      it('should handle an unsubscribe failure', function (done) {
        setupPushManager({
          succeedUnsub: false
        });

        context.executeAction(pushAction.unsubscribe, {}, function (err) {
          var fields = getSettingsFields(context, SettingsStore);
          expect(fields.pushSubscriptionError).to.not.be.null;
          expect(err).to.be.an('Error');
          done();
        });
      });

      it('should handle an service error', function (done) {
        setupPushManager({
          succeedUnsub: true
        });

        context.executeAction(pushAction.unsubscribe, {
          emulateError: true
        }, function (err) {
          var fields = getSettingsFields(context, SettingsStore);
          expect(fields.pushSubscriptionError).to.not.be.null;
          expect(err).to.be.an('Error');
          done();
        });
      });

      it('should handle an unsubscribe reject', function (done) {
        setupPushManager({
          succeedUnsub: true,
          rejectUnsub: true
        });

        context.executeAction(pushAction.unsubscribe, {}, function (err) {
          var fields = getSettingsFields(context, SettingsStore);
          expect(fields.pushSubscriptionError).to.not.be.null;
          expect(err).to.be.an('Error');
          done();
        });
      });

      it('should handle getSubscription reject', function (done) {
        setupPushManager({
          rejectGetSub: true
        });

        context.executeAction(pushAction.unsubscribe, {}, function (err) {
          var fields = getSettingsFields(context, SettingsStore);
          expect(fields.pushSubscriptionError).to.not.be.null;
          expect(err).to.be.an('Error');
          done();
        });
      });
    });
  });
});
