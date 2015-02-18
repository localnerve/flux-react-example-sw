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

describe('configs index', function() {
  it('accepts overrides', function() {
    var value = 'ItsAPizzaPie1';
    var config = configLib.create({ PIZZA: value });
    expect(config.get('PIZZA')).to.equal(value);
  });

  it('loads env vars', function() {
    var value = 'ItsAPizzaPie2';
    process.env.PIZZA = value;

    var config = configLib.create();
    expect(config.get('PIZZA')).to.equal(value);
  });

  it('fallsback to local dev env vars', function() {
    var value = localEnv.PORT;

    delete process.env.PORT; // not sure if this really works
    assert.isUndefined(process.env.PORT, 'process.env.PORT was unexpectedly defined and invalidated this test');

    var config = configLib.create();
    expect(config.get('PORT')).to.equal(value);
  });

  it('allows env vars to override to local dev env vars', function() {
    var value = 8080;
    process.env.PORT = value;

    var config = configLib.create();
    expect(Number(config.get('PORT'))).to.equal(value);
  });

  it('loads some expected defaults', function() {
    var config = configLib.create();
    expect(config.get('settings').web).to.be.an('object');
  });
});