/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it */
'use strict';

var expect = require('chai').expect;
var assert = require('chai').assert;
var localEnv = require('../../../configs/local.env.json');
var configLib = require('../../../configs');

describe('configs', function () {
  // index
  describe('index', function () {
    it('accepts overrides', function () {
      var value = 'ItsAPizzaPie1';
      var config = configLib.create({ PIZZA: value });
      expect(config.get('PIZZA')).to.equal(value);
    });

    it('loads env vars', function () {
      var value = 'ItsAPizzaPie2';
      process.env.PIZZA = value;

      var config = configLib.create();
      expect(config.get('PIZZA')).to.equal(value);
    });

    it('fallsback to local dev env vars', function () {
      var value = localEnv.PORT;

      delete process.env.PORT; // not sure if this really works
      assert.isUndefined(process.env.PORT, 'process.env.PORT was unexpectedly defined and invalidated this test');

      var config = configLib.create();
      expect(config.get('PORT')).to.equal(value);
    });

    it('allows env vars to override to local dev env vars', function () {
      var value = 8080;
      process.env.PORT = value;

      var config = configLib.create();
      expect(Number(config.get('PORT'))).to.equal(value);
    });

    it('loads some expected defaults', function () {
      var config = configLib.create();
      expect(config.get('settings').web).to.be.an('object');
    });

    it.skip('loads script asset dynamically as expected', function () {
    });
  });

  describe('data', function () {
    // FRED
    describe('FRED', function () {
      it('decorates FRED url', function () {
        var config = configLib.create().get('data');
        var decoration = config.FRED.branchify('');
        var url = config.FRED.url();
        expect(url).to.contain(decoration);
      });

      it('changes decoration by environment', function () {
        var config1 = configLib.create({ NODE_ENV: 'production' }).get('data');
        var decoration1 = config1.FRED.branchify('');

        var config2 = configLib.create({ NODE_ENV: 'development' }).get('data');
        var decoration2 = config2.FRED.branchify('');

        expect(decoration1).to.not.equal(decoration2);
      });
    });
  });
});