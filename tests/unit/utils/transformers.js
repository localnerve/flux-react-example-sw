/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, beforeEach */
'use strict';

var expect = require('chai').expect;
var routesResponse = require('../../fixtures/routes-response');
var transformers = require('../../../utils/transformers');
var MockContext = require('fluxible/utils/MockActionContext')();

describe('transformers', function () {
  describe('toFluxibleRoutes', function() {
    var jsonRoutes;
    var context;
    var toFluxibleRoutes = transformers.toFluxibleRoutes;

    beforeEach(function() {
      // clone routesResponse so we don't disrupt routes-response.
      jsonRoutes = JSON.parse(JSON.stringify(routesResponse));
      context = new MockContext();
    });

    it('should transform json routes to fluxible routes', function(done) {    
      var testKey = 'home';

      // check input types
      expect(jsonRoutes).to.be.an('object');
      expect(jsonRoutes[testKey].action).to.be.an('object');

      var fluxibleRoutes = toFluxibleRoutes(jsonRoutes);

      // check output types
      expect(fluxibleRoutes).to.be.an('object');
      expect(fluxibleRoutes[testKey].action).to.be.a('function');

      // check that no keys are lost
      expect(Object.keys(jsonRoutes).length).to.equal(
        Object.keys(fluxibleRoutes).length
      );

      // check that the output action is workable
      fluxibleRoutes[testKey].action(context, {}, done);
    });

    it('should throw if an unknown action is specified', function() {
      jsonRoutes.home.action.name = 'unknown_action';

      expect(function() {
        toFluxibleRoutes(jsonRoutes);
      }).to.throw(Error, /not found/);
    });
  });
});