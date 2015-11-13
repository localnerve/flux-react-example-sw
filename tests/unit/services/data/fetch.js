/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
 /* global before, after, describe, it */
'use strict';

var expect = require('chai').expect;
var mocks = require('../../../mocks');

var config = require('../../../../configs').create().data;

describe('data/fetch', function () {
  var fetch, cache, request;

  before(function () {
    mocks.superAgent.begin();
    fetch = require('../../../../services/data/fetch');
    cache = require('./cache');
    request = require('superagent');
  });

  after(function () {
    mocks.superAgent.end();
  });

  describe('fetchOne', function () {
    it('should fetch the FRED if no url supplied', function (done) {
      fetch.fetchOne({ resource: 'test' }, function (err, res) {
        if (err) {
          return done(err);
        }

        expect(res).to.equal(cache.get());
        expect(request.url).to.equal(config.FRED.url());

        done();
      });
    });

    it('should fetch the supplied url', function (done) {
      var supplied = '123456789';
      fetch.fetchOne({ resource: 'test', url: supplied }, function (err, res) {
        if (err) {
          return done(err);
        }

        expect(res).to.equal(cache.get());
        expect(request.url).to.contain(supplied);

        done();
      });
    });
  });

  describe('fetchMain', function () {
    it('should fetch the main resource', function (done) {
      fetch.fetchMain(function (err, res) {
        if (err) {
          return done(err);
        }

        expect(res).to.equal(cache.get('routes'));
        expect(request.url).to.equal(config.FRED.url());

        done();
      });
    });
  });

  describe('fetchAll', function () {
    it('should fetch all resources', function (done) {
      fetch.fetchAll(function (err, res) {
        if (err) {
          return done(err);
        }

        var routes = cache.get('routes');

        // It should return content for each route
        expect(Object.keys(routes).length).to.equal(res.length);
        if (res.length > 0) {
          // And they should be the default response
          expect(res[0]).to.equal(cache.get());
        }

        done();
      });
    });
  });
});
