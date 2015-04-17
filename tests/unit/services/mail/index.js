/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
 /* global before, after, describe, it */
'use strict';

// var expect = require('chai').expect;
// var mocks = require('../../../utils/mocks');

describe('mail/index', function () {
  var mail;

  before(function () {
    // mocks.send.begin();
    mail = require('../../../../services/mail/index');
    // cache = require('./cache');
  });

  after(function () {
    // mocks.send.end();
  });

  it.skip('should behave correctly', function () {
  });
});