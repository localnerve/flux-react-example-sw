/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global after, afterEach, before, beforeEach, describe, it */
'use strict';

var expect = require('chai').expect;
var mocks = require('../../../mocks');
var syncable = require('../../../../utils/syncable');

describe('sw/sync/index', function () {
  var index, treoMock, toolboxMock;
  var request, url = 'http://someurl', apiPath = '/api';

  before('sw/sync/index setup', function () {
    mocks.swSyncIndex.begin();

    index = require('../../../../assets/scripts/sw/sync');
    treoMock = require('treo');
    toolboxMock = require('sw-toolbox');

    toolboxMock.mockSetup();
    treoMock.setValue([]);

    global.Request = require('../../../mocks/request');
    global.Blob = require('../../../mocks/blob');
  });

  after('sw/sync/index teardown', function () {
    toolboxMock.mockTeardown();
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

  function Self () {
    this.teardownReg = false;
    this.teardownSelf = false;
  }
  Self.prototype = {
    setup: function () {
      if (global.self) {
        global.self.registration = global.self.registration ||
          (this.teardownReg = true, {});
      } else {
        this.teardownSelf = true;
        global.self = {};
        global.self.registration = {};
      }
    },
    teardown: function () {
      if (this.teardownSelf) {
        delete global.self;
      } else {
        if (this.teardownReg) {
          delete global.self.registration;
        }
      }
    }
  };

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
    var self = new Self(),
        reporterCalled;

    before('deferRequest setup', function () {
      global.Response = require('../../../mocks/response');
      self.setup();
    });

    after('deferRequest teardown', function () {
      delete global.Response;
      self.teardown();
    });

    beforeEach(function () {
      reporterCalled = false;
      treoMock.setReporter(function (method) {
        /*
        console.log('@@@');
        console.log(require('util').inspect(arguments));
        console.log('@@@');
        */
        reporterCalled = true;
        expect(method).to.equal('put');
      });
    });

    afterEach(function () {
      expect(reporterCalled).to.be.true;
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

  describe('serviceAllRequests', function () {
    var self = new Self(), mockDb, mockFetch,
        unexpectedError = new Error('unexpected error');

    before('serviceAllRequests setup', function () {
      mockDb = require('./idb');
      mockFetch = require('../../../mocks/sw-fetch');

      global.Response = require('../../../mocks/response');
      global.fetch = mockFetch.fetch;
    });

    after('serviceAllRequests teardown', function () {
      delete global.Response;
      delete global.fetch;
    });

    beforeEach(function (done) {
      var mockApis = {};
      mockApis[apiPath] = {
        xhrContext: {}
      };

      self.setup();
      mockDb.setValue(mockApis);

      // capture the dehydratedRequest from deferRequest and use it for
      // to represent a dehydratedRequests collection from treo.
      treoMock.setReporter(function (method, key, dehydratedRequest) {
        if (method === 'put') {
          treoMock.setValue([
            dehydratedRequest
          ]);
        }
      });

      index.deferRequest(apiPath, request).then(function () {
        done();
      }).catch(function (err) {
        console.log('@@@');
        console.log('error setup serviceAllRequests = ' + require('util').inspect(err));
        console.log('@@@');
      });
    });

    afterEach(function () {
      mockDb.setValue(undefined);
      treoMock.setValue(undefined);
      treoMock.setReporter(undefined);
      mockFetch.setEmulateError(false);
      self.teardown();
    });

    it('should read requests, fetch, and maintain storage', function (done) {
      var calledDel = 0;

      // Capture idb.del
      treoMock.setReporter(function (method) {
        if (method === 'del') {
          calledDel++;
        }
      });

      index.serviceAllRequests().then(function () {
        expect(calledDel).to.equal(1);
        done();
      }).catch(function (err) {
        done(err || unexpectedError);
      });
    });

    it('should throw when no api found failure', function (done) {
      mockDb.setValue({});

      index.serviceAllRequests().catch(function (error) {
        expect(error.toString()).to.be.a('string').that.is.not.empty;
        done();
      });
    });

    it('should handle fetch failure', function (done) {
      var calledPut = 0;

      treoMock.setReporter(function (method, key, dehydratedRequest) {
        if (method === 'put') {
          calledPut++;
          expect(dehydratedRequest.failureCount).to.equal(1);
        }
      });

      mockFetch.setEmulateError(true);

      index.serviceAllRequests().then(function () {
        expect(calledPut).to.equal(1);
        done();
      }).catch(function (err) {
        done(err || unexpectedError);
      });
    });

    it('should handle bad response', function (done) {
      var calledTest = false, calledPut = 0;

      treoMock.setReporter(function (method, key, dehydratedRequest) {
        if (method === 'put') {
          calledPut++;
          expect(dehydratedRequest.failureCount).to.equal(1);
        }
      });

      index.serviceAllRequests({
        successResponses: {
          test: function () {
            calledTest = true;
            return false;
          }
        }
      }).then(function () {
        expect(calledPut).to.equal(1);
        expect(calledTest).to.be.true;
        done();
      }).catch(function (err) {
        done(err || unexpectedError);
      });
    });

    it('should handle max failures', function (done) {
      var calledDel = 0;

      // Set failureCount beyond limit
      treoMock.getValue()[0].failureCount = 3;

      // Capture idb.del
      treoMock.setReporter(function (method) {
        if (method === 'del') {
          calledDel++;
        }
      });

      mockFetch.setEmulateError(true);

      index.serviceAllRequests().then(function (results) {
        expect(calledDel).to.equal(1);
        expect(results[0].failureCount).to.be.at.least(3);
        done();
      }).catch(function (err) {
        done(err || unexpectedError);
      });
    });
  });
});
