/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global Promise, after, before, describe, it */
'use strict';

var expect = require('chai').expect;
var _ = require('lodash');
var mocks = require('../../../mocks');
var syncable = require('../../../../utils/syncable');
var Self = require('../../../mocks/self');

describe('sw/sync/serviceable', function () {
  var index, treoMock, toolboxMock, self = new Self(),
      subscriptionId = '123456789';
  var serviceable;
  var dehydratedRequests;

  before('sw/sync/serviceable setup', function () {
    mocks.swSyncIndex.begin();

    index = require('../../../../assets/scripts/sw/sync');
    treoMock = require('treo');
    toolboxMock = require('sw-toolbox');

    toolboxMock.mockSetup();
    treoMock.setValue([]);
    self.setup({
      pushManager: {
        subReject: false,
        subscribed: true
      }
    });

    global.Request = require('../../../mocks/request');
    global.Response = require('../../../mocks/response');
    global.Blob = require('../../../mocks/blob');

    serviceable = require('../../../../assets/scripts/sw/sync/serviceable');
  });

  after('sw/sync/serviceable teardown', function () {
    delete global.Request;
    delete global.Response;
    delete global.Blob;
    self.teardown();
    toolboxMock.mockTeardown();
    mocks.swSyncIndex.end();
  });

  function createDehydratedRequests (bodies) {
    // the side-effect output
    dehydratedRequests = [];

    treoMock.setReporter(function (method, key, request) {
      if (method === 'put') {
        // allow the body to determine fake ordering via fake timestamp.
        request.timestamp = request.body.timestamp || request.timestamp;
        delete request.body.timestamp;

        dehydratedRequests.push(request);
      }
    });

    return Promise.all(bodies.map(function (body) {
      return index.deferRequest('/api', new global.Request('someurl', {
        body: body
      }));
    }));
  }

  describe('getRequests', function () {
    it('should get contact and topic requests', function (done) {
      createDehydratedRequests([
        syncable.contact({
          some1: 'body1'
        }, 'test1@email'),
        syncable.push({
          some2: 'body2',
          tag: 'someTopic'
        }, subscriptionId, syncable.ops.updateTopics)
      ])
      .then(function () {
        return serviceable.getRequests(dehydratedRequests);
      })
      .then(function (serviceableRequests) {
        var diff = _.xor(dehydratedRequests, serviceableRequests);

        expect(diff.length).to.equal(0);
        done();
      });
    });

    it('should get both contact and unsubscribe requests', function (done) {
      createDehydratedRequests([
        syncable.contact({
          some1: 'body1'
        }, 'test1@email'),
        syncable.push({
          some2: 'body2'
        }, subscriptionId, syncable.ops.unsubscribe)
      ])
      .then(function () {
        return serviceable.getRequests(dehydratedRequests);
      })
      .then(function (serviceableRequests) {
        var diff = _.xor(dehydratedRequests, serviceableRequests);

        expect(diff.length).to.equal(0);
        done();
      });
    });

    it('should get unsubscribe requests over topics requests', function (done) {
      createDehydratedRequests([
        syncable.push({
          some1: 'body1'
        }, subscriptionId, syncable.ops.updateTopics),
        syncable.push({
          some2: 'body2'
        }, subscriptionId, syncable.ops.unsubscribe)
      ])
      .then(function () {
        return serviceable.getRequests(dehydratedRequests);
      })
      .then(function (serviceableRequests) {
        expect(serviceableRequests.length).to.equal(1);
        expect(serviceableRequests[0].fallback.operation)
          .to.equal(syncable.ops.unsubscribe);
        done();
      });
    });
  });

  describe('pruneRequests', function () {
    it('should remove unserviceable requests', function (done) {
      var updateTopicsTime = 1001,
          calledDel = 0;

      createDehydratedRequests([
        syncable.push({
          some1: 'body1',
          timestamp: updateTopicsTime
        }, subscriptionId, syncable.ops.updateTopics),
        syncable.push({
          some2: 'body2',
          timestamp: updateTopicsTime + 1
        }, subscriptionId, syncable.ops.unsubscribe)
      ])
      .then(function () {
        return serviceable.getRequests(dehydratedRequests);
      })
      .then(function (serviceableRequests) {
        // Replace previous reporter to listen for 'del'
        treoMock.setReporter(function (method, key) {
          if (method === 'del') {
            // should've deleted updateTopics as unserviceable since it
            // received unsubscribe later (updateTopicsTime + 1).
            expect(key).to.equal(updateTopicsTime);
            calledDel++;
          }
        });

        return serviceable.pruneRequests(dehydratedRequests, serviceableRequests);
      })
      .then(function () {
        expect(calledDel).to.equal(1);
        done();
      });
    });
  });

  describe('pruneRequestsByPolicy', function () {
    /**
     * Remove a dehydrateRequest from dehydratedRequests if it matches
     * the given timestamp.
     *
     * @param {String} the timestamp to match.
     * @returns {Object} The matching dehydrateRequest.
     */
    function removeMatchingDehydratedRequest (timestamp) {
      var matchingRequest;

      dehydratedRequests = dehydratedRequests.reduce(function (prev, curr) {
        if (curr.timestamp === timestamp) {
          matchingRequest = curr;
          return prev;
        }
        prev.push(curr);
        return prev;
      }, []);

      return matchingRequest;
    }

    it('should remove prior matching contact requests by policy', function (done) {
      var calledDel = 0,
          contactKey = 'test1@email',
          contactTime = 1001,
          contactTimesToDelete = [
            contactTime,
            contactTime + 1
          ];

      createDehydratedRequests([
        syncable.contact({
          some1: 'body1',
          timestamp: contactTimesToDelete[0]
        }, contactKey),
        syncable.contact({
          some2: 'body2',
          timestamp: contactTimesToDelete[1]
        }, contactKey),
        syncable.contact({
          some3: 'body3',
          timestamp: contactTime + 2 // 'successful'
        }, contactKey)
      ])
      .then(function () {
        return removeMatchingDehydratedRequest(contactTime + 2);
      })
      .then(function (reqContact) {
        // Replace previous reporter to listen for 'del'
        treoMock.setReporter(function (method, key) {
          if (method === 'del') {
            expect(contactTimesToDelete.indexOf(key) !== -1).to.be.true;
            calledDel++;
          }
        });

        return serviceable.pruneRequestsByPolicy(
          dehydratedRequests, reqContact.fallback
        );
      })
      .then(function () {
        expect(calledDel).to.equal(dehydratedRequests.length);
        done();
      });
    });

    it('should remove prior push requests', function (done) {
      var calledDel = 0,
          pushTime = 1001,
          pushTimesToDelete = [
            pushTime,
            pushTime + 1
          ];

      createDehydratedRequests([
        syncable.push({
          some1: 'body1',
          timestamp: pushTimesToDelete[0]
        }, subscriptionId, syncable.ops.updateTopics),
        syncable.push({
          some2: 'body2',
          timestamp: pushTimesToDelete[1]
        }, subscriptionId, syncable.ops.unsubscribe),
        syncable.push({
          some3: 'body3',
          timestamp: pushTime + 2 // 'successful'
        }, subscriptionId, syncable.ops.subscribe)
      ])
      .then(function () {
        return removeMatchingDehydratedRequest(pushTime + 2);
      })
      .then(function (reqPush) {
        // Replace previous reporter to listen for 'del'
        treoMock.setReporter(function (method, key) {
          if (method === 'del') {
            expect(pushTimesToDelete.indexOf(key) !== -1).to.be.true;
            calledDel++;
          }
        });

        return serviceable.pruneRequestsByPolicy(
          dehydratedRequests, reqPush.fallback
        );
      })
      .then(function () {
        expect(calledDel).to.equal(dehydratedRequests.length);
        done();
      });
    });

    it('should resolve to undefined if no policy found', function (done) {
      var calledDel = 0, invalidType = 'invalid';

      expect(Object.keys(syncable.types).indexOf(invalidType)).to.equal(-1);

      // Replace previous reporter to listen for 'del'
      treoMock.setReporter(function (method, key) {
        if (method === 'del') {
          calledDel++;
        }
      });

      serviceable.pruneRequestsByPolicy(null, {
        type: invalidType
      })
      .then(function (result) {
        expect(result).to.be.undefined;
        expect(calledDel).to.equal(0);
        done();
      });
    });
  });
});
