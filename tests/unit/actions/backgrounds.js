/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, beforeEach */
'use strict';

var expect = require('chai').expect;

var createMockActionContext = require('fluxible/utils').createMockActionContext;
var initBackgroundsAction = require('../../../actions/backgrounds').init;
var BackgroundStore = require('../../../stores/BackgroundStore');

describe('init backgrounds action', function () {
  var context, params = {
    serviceUrl: 'imageService',
    backgrounds: ['1', '2']
  };

  // create the action context wired to BackgroundStore
  beforeEach(function () {
    context = createMockActionContext({
      stores: [ BackgroundStore ]
    });
  });

  it('should update the background store', function (done) {
    context.executeAction(initBackgroundsAction, params, function (err) {
      if (err) {
        return done(err);
      }

      var store = context.getStore(BackgroundStore);

      expect(store.getImageServiceUrl()).to.equal(params.serviceUrl);
      expect(Object.keys(store.backgroundUrls)).to.have.length(2);

      done();
    });
  });
});
