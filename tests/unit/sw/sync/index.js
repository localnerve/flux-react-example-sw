/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global after, before, beforeEach, describe, it */
'use strict';

var expect = require('chai').expect;
var mocks = require('../../../mocks');
var syncable = require('../../../../utils/syncable');

describe('sw/sync', function () {
  describe('index', function () {
    var index, treoMock;
    var request, url = 'http://someurl';

    before('sw/sync/index setup', function () {
      mocks.swSyncIndex.begin();

      index = require('../../../../assets/scripts/sw/sync');
      treoMock = require('treo');

      treoMock.setMockValue([]);

      global.Request = require('../../../mocks/request');
      global.Blob = require('../../../mocks/blob');
    });

    after('sw/sync/index teardown', function () {
      mocks.swSyncIndex.end();
      delete global.Request;
      delete global.Blob;
    });

    beforeEach(function () {
      // mock a js body with a _fallback property.
      var body = syncable.contact({
        some: 'body'
      }, 'test@email');

      request = new global.Request(url, {
        credentials: 'notgood',
        body: body
      });
    });

    describe('removeFallback', function () {
      it('should remove fallback property', function (done) {
        index.removeFallback({}, request)
        .then(function (req) {
          return req.json();
        })
        .then(function (body) {
          expect(body[syncable.propertyName]).to.be.undefined;
          done();
        });
      });

      it('should include options', function (done) {
        var credInclude = 'include';

        index.removeFallback({
          credentials: credInclude
        }, request).then(function (req) {
          expect(req.credentials).to.equal(credInclude);
          done();
        });
      });
    });

    describe('maintainRequests', function () {
      it('should pass through the given response', function (done) {
        var response = {
          test: 'response'
        };

        index.maintainRequests({}, response, request)
        .then(function (result) {
          expect(result).to.eql(response);
          done();
        });
      });
    });

    describe('deferRequest', function () {
      var teardownSelf = false, teardownReg = false, apiPath = '/api';

      before('deferRequest setup', function () {
        global.Response = require('../../../mocks/response');

        if (global.self) {
          global.self.registration = global.self.registration ||
            (teardownReg = true, {});
        } else {
          teardownSelf = true;
          global.self = {};
          global.self.registration = {};
        }
      });

      after('deferRequest teardown', function () {
        delete global.Response;

        if (teardownSelf) {
          delete global.self;
        } else {
          if (teardownReg) {
            delete global.self.registration;
          }
        }
      });

      it('should return a deferred response', function (done) {
        index.deferRequest(apiPath, request)
        .then(function (response) {
          return response.json();
        })
        .then(function (body) {
          expect(body).to.equal('deferred');
          done();
        });
      });
    });
  });
});
