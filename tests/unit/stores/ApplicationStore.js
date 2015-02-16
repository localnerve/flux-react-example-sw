/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License.
 * See https://github.com/yahoo/fluxible.io/blob/master/LICENSE.md for terms.
 */
/* global describe, it, beforeEach */
'use strict';
var expect = require('chai').expect;
var ApplicationStore = require('../../../stores/ApplicationStore');
var routesResponse = require('../../fixtures/routes-response');

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
    expect(storeInstance.currentPage).to.equal(null);
    expect(storeInstance.currentRoute).to.equal(null);
    expect(storeInstance.pages).to.be.empty;
    expect(storeInstance.pageTitle).to.equal('');
    done();
  });

  describe('with routes', function() {
    beforeEach(function() {
      storeInstance.receiveRoutes(routesResponse);
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

    it('should update page title', function (done) {
      var title = { pageTitle: 'Fluxible Rocks' };
      storeInstance.updatePageTitle(title);

      expect(storeInstance.pageTitle).to.equal(title.pageTitle);
      done();
    });

    it('should get current page name', function (done) {
      storeInstance.handleNavigate(homeRoute);

      expect(storeInstance.getCurrentPageName()).to.equal(homeRoute.config.page);
      done();
    });

    it('should get current page title', function (done) {
      var title = { pageTitle: 'Fluxible Rocks' };
      storeInstance.updatePageTitle(title);

      expect(storeInstance.getPageTitle()).to.equal(title.pageTitle);
      done();
    });

    it('should get current route', function (done) {
      storeInstance.handleNavigate(homeRoute);

      expect(storeInstance.getCurrentRoute()).to.equal(homeRoute);
      done();
    });

    it('should dehydrate', function (done) {
      storeInstance.handleNavigate(homeRoute);
      var title = { pageTitle: 'Fluxible Rocks' };
      storeInstance.updatePageTitle(title);

      var state = storeInstance.dehydrate();
      expect(state.currentPageName).to.equal(homeRoute.config.page);
      expect(state.currentPage).to.equal(routesResponse[homeRoute.config.page]);
      expect(state.pages).to.equal(routesResponse);
      expect(state.route).to.equal(homeRoute);
      expect(state.pageTitle).to.equal(title.pageTitle);
      done();
    });

    it('should rehydrate', function (done) {
      var title = { pageTitle: 'Fluxible Rocks' };
      var state = {
        currentPageName: homeRoute.config.page,
        currentPage: routesResponse[homeRoute.config.page],
        pages: routesResponse,
        route: homeRoute,
        pageTitle: title.pageTitle
      };

      storeInstance.rehydrate(state);

      expect(storeInstance.currentPageName).to.equal(homeRoute.config.page);
      expect(storeInstance.currentPage).to.equal(routesResponse[homeRoute.config.page]);
      expect(storeInstance.pages).to.equal(routesResponse);
      expect(storeInstance.currentRoute).to.equal(homeRoute);
      expect(storeInstance.pageTitle).to.equal(title.pageTitle);
      done();
    });
  });
});
