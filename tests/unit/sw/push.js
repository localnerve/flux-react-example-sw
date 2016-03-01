/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global Promise, after, before, beforeEach, afterEach, describe, it */
'use strict';

var expect = require('chai').expect;
var mocks = require('../../mocks');
var Self = require('../../mocks/self');
var Response = require('../../mocks/response');

describe('sw/push', function () {
  var push;
  var calledPostMessage,
      unexpectedFlowError = new Error('unexpected push error');
  var globalFetch, toolbox, selfMock;

  before('setup sw/push', function () {
    mocks.swToolbox.begin();

    selfMock = new Self();
    toolbox = require('sw-toolbox');
    globalFetch = require('../../mocks/sw-fetch');

    selfMock.setup({
      pushManager: {
        subReject: false,
        subscribed: true
      }
    });

    toolbox.mockSetup();

    global.fetch = globalFetch.fetch;
    global.clients = {
      matchAll: function () {
        return Promise.resolve([{
          focus: function () {
            return Promise.resolve();
          },
          postMessage: function () {
            calledPostMessage++;
          }
        }]);
      },
      openWindow: function () {}
    };

    push = require('../../../assets/scripts/sw/push');
  });

  beforeEach(function () {
    calledPostMessage = 0;
  });

  after(function () {
    delete global.clients;
    delete global.fetch;
    toolbox.mockTeardown();
    selfMock.teardown();
    mocks.swToolbox.end();
  });

  describe('push event', function () {
    var errorNotification = false;

    afterEach(function () {
      selfMock.setup({
        showNotificationFn: null,
        pushManager: {
          subReject: false,
          subscribed: {
            subscriptionId: 123456
          }
        }
      });
      globalFetch.setEmulateError(false);
      globalFetch.setMockResponse(undefined);
      globalFetch.setResponseDelay(0);
      errorNotification = false;
    });

    function setErrorNotification (title) {
      errorNotification = title.toLowerCase().indexOf('error') > -1;
    }

    it('should handle subscription failure as expected', function (done) {
      selfMock.setup({
        pushManager: {
          subReject: true
        }
      });

      selfMock.events.push({
        waitUntil: function (promise) {
          promise.then(function () {
            done(unexpectedFlowError);
          })
          .catch(function (error) {
            expect(error).to.not.be.undefined;
            done();
          });
        }
      });
    });

    it('should handle fetch failure as expected', function (done) {
      globalFetch.setEmulateError(true);

      selfMock.setup({
        showNotificationFn: setErrorNotification
      });

      selfMock.events.push({
        waitUntil: function (promise) {
          promise.then(function () {
            expect(errorNotification).to.be.true;
            done();
          })
          .catch(function (error) {
            done(error || unexpectedFlowError);
          });
        }
      });
    });

    it('should handle unsuccessful fetch as expected', function (done) {
      globalFetch.setMockResponse(new Response({
        mock: 'body'
      }, {
        status: 400
      }));

      selfMock.setup({
        showNotificationFn: setErrorNotification
      });

      selfMock.events.push({
        waitUntil: function (promise) {
          promise.then(function () {
            expect(errorNotification).to.be.true;
            done();
          })
          .catch(function (error) {
            done(error || unexpectedFlowError);
          });
        }
      });
    });

    it('should notify on successful fetch', function (done) {
      var gotTitle = false;
      var dataTitle = 'successful fetch';

      globalFetch.setMockResponse(new Response({
        title: dataTitle
      }));

      selfMock.setup({
        showNotificationFn: function (title) {
          gotTitle = title === dataTitle;
        }
      });

      selfMock.events.push({
        waitUntil: function (promise) {
          promise.then(function () {
            expect(gotTitle).to.be.true;
            done();
          })
          .catch(function (error) {
            done(error || unexpectedFlowError);
          });
        }
      });
    });
  });

  describe('notificationclick event', function () {
    var clientsBackup;

    function createNotificationEvent (successHandler, done) {
      return {
        notification: {
          data: {
          },
          close: function () {}
        },
        waitUntil: function (promise) {
          promise.then(function () {
            successHandler();
            done();
          })
          .catch(function (error) {
            done(error || unexpectedFlowError);
          });
        }
      };
    }

    beforeEach(function () {
      clientsBackup = Object.assign({}, global.clients);
    });

    afterEach(function () {
      global.clients = clientsBackup;
    });

    it('should call postMessage for existing clients', function (done) {
      selfMock.events.notificationclick(
        createNotificationEvent(function () {
          expect(calledPostMessage).to.equal(1);
        }, done)
      );
    });

    it('should call openWindow for new clients', function (done) {
      var calledOpenWindow = 0;

      // resolve to empty array for "no existing clients"
      global.clients.matchAll = function () {
        return Promise.resolve([]);
      };
      global.clients.openWindow = function () {
        calledOpenWindow++;
      };

      selfMock.events.notificationclick(
        createNotificationEvent(function () {
          expect(calledOpenWindow).to.equal(1);
        }, done)
      );
    });
  });

  describe.skip('pushsubscriptionchange event', function () {
  });
});
