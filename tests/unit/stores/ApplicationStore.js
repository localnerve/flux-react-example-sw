/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, beforeEach */
'use strict';

var expect = require('chai').expect;
var ApplicationStore = require('../../../stores/ApplicationStore');
var routesResponseFixture = require('../../fixtures/routes-response');
var helperTests = require('../../utils/tests');

var transformer = require('../../../utils').createFluxibleRouteTransformer({
  actions: require('../../../actions/interface')
});

describe('application store', function () {
  var storeInstance;
  var homeRoute = {
    params: { key: 'home' },
    config: { page: 'Home' }
  };

  beforeEach(function () {
    storeInstance = new ApplicationStore();
  });

  it('should instantiate correctly', function (done) {
    expect(storeInstance).to.be.an('object');
    expect(storeInstance.currentPageId).to.equal(null);
    expect(storeInstance.currentPageName).to.equal(null);
    expect(storeInstance.currentRoute).to.equal(null);
    expect(storeInstance.pages).to.be.empty;
    expect(storeInstance.currentPageTitle).to.equal('');
    done();
  });

  describe('with routes', function () {
    var routesResponse;

    beforeEach(function () {
      // clone the routes-response fixture data
      routesResponse = JSON.parse(JSON.stringify(routesResponseFixture));
      storeInstance.receiveRoutes(transformer.jsonToFluxible(routesResponse));
    });

    it('should handle navigate', function (done) {
      storeInstance.handleNavigate(homeRoute);

      expect(storeInstance.currentPageId).to.equal(homeRoute.params.key);
      done();
    });

    it('should return early during handle navigate, when navigating to the same page', function (done) {
      // initial call
      storeInstance.handleNavigate(homeRoute);
      // subsequent call
      storeInstance.handleNavigate(homeRoute);

      expect(storeInstance.currentPageId).to.equal(homeRoute.params.key);
      done();
    });

    it('should update page', function (done) {
      var page = { title: 'Fluxible Rocks' };
      storeInstance.updatePageTitle(page);

      expect(storeInstance.currentPageTitle).to.equal(page.title);
      expect(storeInstance.currentPageContent).to.equal(page.content);
      done();
    });

    it('should get current page name', function (done) {
      storeInstance.handleNavigate(homeRoute);

      expect(storeInstance.getCurrentPageName()).to.equal(homeRoute.config.page);
      done();
    });

    it('should get current page title', function (done) {
      var page = { title: 'Fluxible Rocks' };
      storeInstance.updatePageTitle(page);

      expect(storeInstance.getCurrentPageTitle()).to.equal(page.title);
      done();
    });

    it('should get current route', function (done) {
      storeInstance.handleNavigate(homeRoute);

      expect(storeInstance.getCurrentRoute()).to.equal(homeRoute);
      done();
    });

    it('should dehydrate', function (done) {
      storeInstance.handleNavigate(homeRoute);
      var page = { title: 'Fluxible Rocks' };
      storeInstance.updatePageTitle(page);

      var state = storeInstance.dehydrate();

      expect(state.pageName).to.equal(homeRoute.config.page);
      expect(state.pages).to.eql(routesResponse);
      expect(state.route).to.equal(homeRoute);
      expect(state.pageTitle).to.equal(page.title);
      done();
    });

    it('should rehydrate', function (done) {
      var page = { title: 'Fluxible Rocks' };
      var state = {
        pageName: homeRoute.config.page,
        pages: routesResponse,
        route: homeRoute,
        pageTitle: page.title
      };

      storeInstance.rehydrate(state);

      helperTests.testTransform(
        expect, storeInstance.pages, transformer.jsonToFluxible(routesResponse)
      );
      expect(storeInstance.getCurrentPageName()).to.equal(homeRoute.config.page);
      expect(storeInstance.getCurrentRoute()).to.equal(homeRoute);
      expect(storeInstance.getCurrentPageTitle()).to.equal(page.title);
      done();
    });
  });
});
