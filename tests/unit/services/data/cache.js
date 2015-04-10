/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
 /* global describe, it */
'use strict';

var expect = require('chai').expect;

var cache = require('../../../../services/data/cache');
var cacheResources = require('../../../fixtures/cache-resources');

describe('data/cache', function () {
  var models = cacheResources.models;

  describe('put', function () {
    it('should throw if undefined params supplied', function () {
      expect(function () {
        cache.put(undefined, false);
      }).to.throw(Error);
    });

    it('should throw if empty params supplied', function () {
      expect(function () {
        cache.put(cacheResources.nothing, true);
      }).to.throw(Error);
    });

    it('should throw if no data supplied', function () {
      expect(function () {
        cache.put(cacheResources.noData, cacheResources.noData.data);
      }).to.throw(Error);
    });

    it('should throw if bad format supplied', function () {
      expect(function () {
        cache.put(cacheResources.badFormat, cacheResources.badFormat.data);
      }).to.throw(Error);
    });

    it('should format json if no format supplied', function () {
      cache.put(cacheResources.noFormat, cacheResources.noFormat.data);
      expect(cache.get(cacheResources.noFormat.resource)).to.be.an('object');
        // upcoming format change
        // .that.has.property('models', undefined)
        // .and.has.property('data').that.is.an('object');
    });

    it('should put models as expected', function () {
      cache.put(models, models.data);
      expect(cache.get(models.resource)).to.be.an('object')
        .that.is.not.empty;
        // upcoming format change
        // .that.has.property('models', undefined)
        // .and.has.property('data').that.is.an('object');
    });

    it('should put valid data with no models', function () {
      var validNone = cacheResources.markup.validNone;

      cache.put(validNone, validNone.data);
      expect(cache.get(validNone.resource)).to.be.a('string')
        .that.is.not.empty;
        // upcoming format change
        // .that.has.property('models', undefined)
        // .and.has.property('data').that.is.a('string');
    });

    it('should put valid data with single, valid model', function () {
      var validSingle = cacheResources.markup.validSingle;

      cache.put(validSingle, validSingle.data);
      expect(cache.get(validSingle.resource)).to.be.a('string')
        .that.is.not.empty;
        // upcoming format change
        // .that.has.property('models').that.is.an('object')
        // .and.has.property('data', cacheResources.markupData)
    });

    it('should put valid data with multiple, valid model', function () {
      var validMulti = cacheResources.markup.validMulti;

      cache.put(validMulti, validMulti.data);
      expect(cache.get(validMulti.resource)).to.be.a('string')
        .that.is.not.empty;
        // upcoming format change
        // .that.has.property('models').that.is.an('object')
        // .and.has.property('data', cacheResources.markupData)
    });

    it('should have undefined models if invalid model reference supplied', function () {
      var invalid = cacheResources.markup.invalid;

      cache.put(invalid, invalid.data);
      expect(cache.get(invalid.resource)).to.be.a('string')
        .that.is.not.empty;
        // upcoming format change
        // .that.has.deep.property('models.InvalidModel', undefined)
        // .and.has.property('data').that.is.a('string');
    });
  });

  describe('get', function () {
    it('should return undefined for miss', function () {
      expect(cache.get('bogus')).to.be.undefined;
    });

    it('should return valid for hit', function () {
      expect(cache.get(models.resource)).to.be.an('object')
        .that.is.not.empty;
        // upcoming format change
        // .that.has.property('models', undefined)
        // .and.has.property('data').that.is.an('object');
    });
  });
});