/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it */
'use strict';

var expect = require('chai').expect;

var splits = require('../../../utils/splits');

describe('splits', function () {
  it('should expose settings split', function () {
    expect(splits).to.respondTo('settings');
  });

  describe.skip('settings', function () {
  });
});
