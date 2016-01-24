/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
 /* global before, after, describe, it */
'use strict';

var expect = require('chai').expect;
var mocks = require('../../../mocks');

describe('data/index', function () {
  var data, cache;

  before(function () {
    mocks.fetch.begin();
    data = require('../../../../services/data');
    cache = require('./cache');
  });

  after(function () {
    mocks.fetch.end();
  });

  describe('fetch', function () {
    it('should pull from cache if exists', function (done) {
      data.fetch({}, function (err, res) {
        if (err) {
          done(err);
        }

        expect(res).to.equal(cache.get());
        done();
      });
    });

    it('should fetch if not in cache', function (done) {
      data.fetch({ resource: 'miss' }, function (err, res) {
        if (err) {
          done(err);
        }

        expect(res).to.equal('fetch');
        done();
      });
    });
  });

  describe('initialize', function () {
    it('should initialize', function (done) {
      data.initialize(done);
    });
  });

  describe('update', function () {
    it('should update', function (done) {
      data.update(done);
    });
  });
});
