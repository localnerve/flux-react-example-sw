/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, before, beforeEach */
'use strict';

var expect = require('chai').expect;
var routesResponseFixture = require('../../fixtures/routes-response');
var fluxibleRoutesFixture = require('../../fixtures/fluxible-routes');
var helperTests = require('../../utils/tests');
var transformers = require('../../../utils/transformers');
var createMockActionContext = require('fluxible/utils').createMockActionContext;

describe('transformers', function () {
  var jsonRoutes, fluxibleRoutes;
  var jsonToFluxible, fluxibleToJson;
  var context;
  var testKey = 'home';
  var testAction = 'page';
  var testResource = 'test';

  function createMockActionContextHelper() {
    context = createMockActionContext();
    // createMockActionContext is broken
    context.executeActionCalls = [];
    context.dispatchCalls = [];
    context.executeAction = context.prototype.executeAction.bind(context);
    context.service = {
      read: function(resource, params, config, callback) {
        callback('mock');
      }
    };
  }

  function cloneFixtures() {
    // clone routesResponse so we don't disrupt routes-response in require cache.
    jsonRoutes = JSON.parse(JSON.stringify(routesResponseFixture));
    // Fluxible routes are not serializable, that's the whole point.
    delete require.cache[require.resolve('../../fixtures/fluxible-routes')];
    fluxibleRoutesFixture = require('../../fixtures/fluxible-routes');
    fluxibleRoutes = fluxibleRoutesFixture;
  }

  before(function() {
    jsonToFluxible = transformers.jsonToFluxible;
    fluxibleToJson = transformers.fluxibleToJson;
  });

  describe('test fixtures', function() {
    beforeEach(function() {
      cloneFixtures();
    });

    it('json routes should be correct', function() {
      expect(jsonRoutes).to.be.an('object');
      expect(jsonRoutes[testKey].action).to.be.an('object');
    });

    it('fluxible routes should be correct', function() {
      expect(fluxibleRoutes).to.be.an('object');
      expect(fluxibleRoutes[testKey].action).to.be.a('function');
    });
  });

  describe('jsonToFluxible', function() {
    beforeEach(function() {
      cloneFixtures();
      createMockActionContextHelper();
    });

    it('should transform json routes to fluxible routes', function(done) {
      var fluxibleRoutes = jsonToFluxible(jsonRoutes);

      // check output types
      expect(fluxibleRoutes).to.be.an('object');
      expect(fluxibleRoutes[testKey].action).to.be.a('function');

      // check that no keys are lost
      expect(Object.keys(jsonRoutes).length).to.equal(
        Object.keys(fluxibleRoutes).length
      );

      // check that the output action is workable      
      fluxibleRoutes[testKey].action(context, {}, function(err) {
        expect(err).to.equal('mock');
        done();
      });
      
    });

    it('should throw if an unknown action is specified', function() {
      jsonRoutes.home.action.name = 'unknown_action';

      expect(function() {
        jsonToFluxible(jsonRoutes);
      }).to.throw(Error, /not found/);
    });
  });
  
  describe('fluxibleToJson', function() {
    beforeEach(function() {
      cloneFixtures();
    });

    it('should transform fluxible routes to json routes', function() {
      var jsonRoutes = fluxibleToJson(fluxibleRoutes);

      // check output types
      expect(jsonRoutes).to.be.an('object');
      expect(jsonRoutes[testKey].action).to.be.an('object');

      // check that no keys are lost
      expect(Object.keys(fluxibleRoutes).length).to.equal(
        Object.keys(jsonRoutes).length
      );

      // check that action name and params are present
      expect(jsonRoutes[testKey].action.name).to.equal(testAction);
      expect(jsonRoutes[testKey].action.params).to.be.an('object');
      expect(jsonRoutes[testKey].action.params.resource).to.equal(testResource);
    });
  });

  describe('roundtrip', function() {
    beforeEach(function() {
      cloneFixtures();
      createMockActionContextHelper();
    });

    it('should reproduce the json routes', function() {
      var roundtrip = fluxibleToJson(jsonToFluxible(jsonRoutes));
      cloneFixtures();
      expect(roundtrip).to.eql(jsonRoutes);
    });

    it('should reproduce the fluxible routes', function(done) {
      var roundtrip = jsonToFluxible(fluxibleToJson(fluxibleRoutes));
      cloneFixtures();

      helperTests.testTransform(expect, roundtrip, fluxibleRoutes);
      
      // check that the output action is workable
      roundtrip[testKey].action(context, {}, function(err) {
        expect(err).to.equal('mock');
        done();
      });
    });
  });
});