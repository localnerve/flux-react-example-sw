/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, beforeEach */
'use strict';

var expect = require('chai').expect;

var createMockActionContext = require('fluxible/utils').createMockActionContext;
var sizeAction = require('../../../actions/size');
var BackgroundStore = require('../../../stores/BackgroundStore');

describe('size action', function () {
  var context, params = {
    width: 1,
    height: 2,
    top: 3,
    add: false
  };

  // create the action context wired to BackgroundStore
  beforeEach(function () {
    context = createMockActionContext({
      stores: [ BackgroundStore ]
    });
  });

  it('should update the background store', function (done) {
    // TODO: add listener to store to get the whole story
    context.executeAction(sizeAction, params, function (err) {
      if (err) {
        return done(err);
      }

      var store = context.getStore(BackgroundStore);
      expect(store.getTop()).to.equal(params.top);

      done();
    });
  });
});
