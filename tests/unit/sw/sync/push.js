/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global after, before, beforeEach, describe, it */
'use strict';

var expect = require('chai').expect;
var mocks = require('../../../mocks');

describe('sw/sync/push', function () {
  var globalFetch, treoMock, toolboxMock,
      push,
      subscriptionId = '1234567890',
      unexpectedFlowError = new Error('unexpected flow error');

  before('sw/sync/push setup', function () {
    mocks.swToolbox.begin();
    mocks.swUtilsIdbTreo.begin();

    treoMock = require('treo');
    toolboxMock = require('sw-toolbox');

    toolboxMock.mockSetup();

    globalFetch = require('../../../mocks/sw-fetch');
    global.fetch = globalFetch.fetch;

    push = require('../../../../assets/scripts/sw/sync/push');
  });

  after('sw/sync/push teardown', function () {
    delete global.fetch;
    toolboxMock.mockTeardown();

    mocks.swUtilsIdbTreo.end();
    mocks.swToolbox.end();
  });

  describe('synchronize', function () {
    beforeEach(function () {
      treoMock.setValue(null);
      treoMock.setReporter(null);

      globalFetch.setMockResponse(undefined);
      globalFetch.setEmulateError(false);
    });

    describe('no prexisting subscriptionId', function () {
      var calledOther = 0, calledGetId = 0, calledPutId = 0,
          putIdValue;

      beforeEach(function () {
        treoMock.setReporter(function (method, key, value) {
          if (method === 'get' && key === 'id') {
            calledGetId++;
          } else if (method === 'put' && key === 'id') {
            calledPutId++;
            putIdValue = value;
          } else {
            calledOther++;
          }
        });
      });

      it('should update idb if no subscriptionId', function (done) {
        push.synchronize(subscriptionId)
        .then(function () {
          expect(calledGetId).to.equal(1);
          expect(calledPutId).to.equal(1);
          expect(putIdValue).to.exist.and.equal(subscriptionId);
          expect(calledOther).to.equal(0);
          done();
        })
        .catch(function (error) {
          done(error || unexpectedFlowError);
        });
      });
    });

    describe('subscriptionId unchanged', function () {
      var calledOther = 0, calledGetId = 0;

      beforeEach(function () {
        treoMock.setValue(subscriptionId);
        treoMock.setReporter(function (method, key) {
          if (method === 'get' && key === 'id') {
            calledGetId++;
          } else {
            calledOther++;
          }
        });
      });

      it('should do nothing', function (done) {
        push.synchronize(subscriptionId)
        .then(function () {
          expect(calledGetId).to.equal(1);
          expect(calledOther).to.equal(0);
          done();
        })
        .catch(function (error) {
          done(error || unexpectedFlowError);
        });
      });
    });

    describe('subscriptionId changed', function () {
      var calledGetId, calledGetApis, calledPutId;
      var self, SelfMock = require('../../../mocks/self');

      before(function () {
        self = new SelfMock();

        self.setup();
        global.Blob = require('../../../mocks/blob');
        global.Request = require('../../../mocks/request');
        global.Response = require('../../../mocks/response');
      });

      after(function () {
        self.teardown();

        delete global.Blob;
        delete global.Request;
        delete global.Response;
      });

      beforeEach(function () {
        calledGetId = calledGetApis = calledPutId = 0;

        treoMock.setValue(subscriptionId + '-01');
        treoMock.setReporter(function (method, key) {
          if (method === 'get') {
            if (key === 'id') {
              calledGetId++;
            } else if (key === 'apis') {
              calledGetApis++;
              treoMock.setValue({
                '/_api': {
                  xhrPath: '/_api',
                  xhrContext: {
                    _csrf: '1234'
                  }
                }
              });
            }
          } else if (method === 'put' && key === 'id') {
            calledPutId++;
          } else if (method === 'all') {
            treoMock.setValue([]);
          }
        });
      });

      it('should fail if no apiInfo found', function (done) {
        // subvert the standard reporter to emulate missing apiInfo.
        var reporter = treoMock.getReporter();
        treoMock.setReporter(function (method, key) {
          if (method === 'get' && key === 'apis') {
            return treoMock.setValue({});
          }
          return reporter.apply(null, arguments);
        });

        push.synchronize(subscriptionId)
        .then(function () {
          done(unexpectedFlowError);
        })
        .catch(function (error) {
          expect(error).to.be.an('Error');
          done();
        });
      });

      it('should update subscription service', function (done) {
        push.synchronize(subscriptionId)
        .then(function () {
          expect(calledGetId).to.equal(1);
          expect(calledGetApis).to.equal(1);
          expect(calledPutId).to.equal(1);
          done();
        })
        .catch(function (error) {
          done(error || unexpectedFlowError);
        });
      });

      it('should not update on failed response', function (done) {
        globalFetch.setEmulateError(true);

        push.synchronize(subscriptionId)
        .then(function () {
          done(unexpectedFlowError);
        })
        .catch(function (error) {
          expect(calledGetId).to.equal(1);
          expect(calledGetApis).to.equal(1);
          expect(calledPutId).to.equal(0);
          done();
        });
      });

      it('should defer request on bad response', function (done) {
        globalFetch.setMockResponse(new global.Response({}, {
          status: 400,
          statusText: 'bad response'
        }));

        push.synchronize(subscriptionId)
        .then(function (response) {
          expect(response.status).to.equal(203);
          expect(response._body).to.equal('deferred');
          done();
        })
        .catch(function (error) {
          done(error || unexpectedFlowError);
        });
      });
    });
  });
});
