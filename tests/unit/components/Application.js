/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global after, describe, it, before, beforeEach */
'use strict';

require('node-jsx').install({ extension: '.jsx' });

var expect = require('chai').expect;
var testDom = require('../../utils/testdom');

describe('render', function () {
  var createMockComponentContext,
      ApplicationStore, ContentStore,
      serviceData, routesResponse, fluxibleRoutes, fluxibleApp,
      React, ReactAddons;

  before(function load () {
    // We'll be rendering the isomorphic component, so set dom env for react here
    testDom.start();

    // Now proceed to load modules that might use React
    createMockComponentContext = require('fluxible/utils').createMockComponentContext;
    ApplicationStore = require('../../../stores/ApplicationStore');
    ContentStore = require('../../../stores/ContentStore');
    serviceData = require('../../fixtures/service-data');
    routesResponse = require('../../fixtures/routes-response');
    fluxibleRoutes = require('../../fixtures/fluxible-routes');
    fluxibleApp = require('../../../app');
    React = require('react');
    ReactAddons = require('react/addons');
  });

  after(function () {
    testDom.stop();
  });

  describe('application component', function () {
    var appElement, context, testUtils,
        homeRoute, homePage;

    function makeHomePath () {
      return '/';
    }

    before(function () {
      testUtils = ReactAddons.addons.TestUtils;

      homeRoute = {
        params: { key: 'home' },
        config: routesResponse.home
      };

      homePage = {
        resource: routesResponse.home.action.params.resource
      };

      serviceData.fetch(homePage, function(err, data) {
        if (err) {
          throw err;
        }
        homePage.data = data;
      });
    });

    beforeEach(function () {
      context = createMockComponentContext({
        stores: [ApplicationStore, ContentStore]
      });
      context.makePath = makeHomePath;

      var appStore = context.getStore(ApplicationStore);
      var contentStore = context.getStore(ContentStore);

      appStore.receiveRoutes(fluxibleRoutes);
      appStore.handleNavigate(homeRoute);
      contentStore.receivePageContent(homePage);

      appElement = React.createElement(fluxibleApp.getComponent(), {
        context: context
      });
    });

    it.skip('should render home content', function () {
      var app = testUtils.renderIntoDocument(appElement);

      var component = testUtils.findRenderedDOMComponentWithClass(app, 'page-content');

      expect(component.getDOMNode().textContent).to.match(/Home/i);
    });

    it.skip('should render navigation', function () {
      var app = testUtils.renderIntoDocument(appElement);

      // throws if not exactly 1
      testUtils.findRenderedDOMComponentWithTag(app, 'ul');
    });
  });
});
