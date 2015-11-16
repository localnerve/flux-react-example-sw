/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global after, describe, it, before, beforeEach */
'use strict';

require('node-jsx').install({ extension: '.jsx' });

var expect = require('chai').expect;
var objectAssign = require('lodash/object/assign');
var testDom = require('../../utils/testdom');
var jsonToFluxible = require('../../../utils').createFluxibleRouteTransformer({
  actions: require('../../../actions/interface')
}).jsonToFluxible;

describe('application component', function () {
  var createMockComponentContext,
      ApplicationStore, ContentStore, RouteStore, ContactStore, BackgroundStore, ModalStore,
      serviceData, routesResponse, fluxibleRoutes, fluxibleApp,
      React, testUtils,
      routes;

  /**
   * OMG this sux. I'm disappointed in this development. :-(
   * This became required during the React 0.14 / Fluxible 1.0 update.
   * This could just mean the app is faster, but harder to test.
   * This could mean the mocks are now not "mocky" enough. (not fake/deep enough)
   *
   * NOTE: if timeout param approaches ~1500, then you have to this.timeout(),
   * a similar amount in the test. I'm not bumping it automagically in here.
   * (standard timeout is 2000)
   *
   * WHY:
   * This allows the app to perform async things it expects in a browser
   * environment (while jsdom is still around) for <timeout> seconds
   * before declaring the test done and allowing jsdom to be dismantled.
   *
   * exists to wrap timeout call in case more hackery required.
   */
  function settle (timeout, done) {
    setTimeout(done, timeout);
  }

  before(function () {
    // We'll be rendering the isomorphic component, so set dom env for react here
    testDom.start();

    // Now proceed to load modules that might use React
    createMockComponentContext = require('fluxible/utils').createMockComponentContext;
    ApplicationStore = require('../../../stores/ApplicationStore');
    ContentStore = require('../../../stores/ContentStore');
    RouteStore = require('../../../stores/RouteStore');
    ContactStore = require('../../../stores/ContactStore');
    BackgroundStore = require('../../../stores/BackgroundStore');
    ModalStore = require('../../../stores/ModalStore');
    serviceData = require('../../mocks/service-data');
    routesResponse = require('../../fixtures/routes-response');
    fluxibleRoutes = jsonToFluxible(routesResponse);
    fluxibleApp = require('../../../app');
    React = require('react');
    testUtils = require('react-addons-test-utils');

    routes = {
      home: objectAssign({}, fluxibleRoutes.home, {
        url: '/',
        name: 'home',
        params: {},
        query: {}
      }),
      about: objectAssign({}, fluxibleRoutes.about, {
        url: '/about',
        name: 'about',
        params: {},
        query: {}
      }),
      contact: objectAssign({}, fluxibleRoutes.contact, {
        url: '/contact',
        name: 'contact',
        params: {},
        query: {}
      })
    };
  });

  after(function () {
    testDom.stop();
  });

  describe('home', function () {
    var appElement, context, homePage;

    function makeHomePath () {
      return '/';
    }

    before(function () {
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
        stores: [
          ApplicationStore,
          ContentStore,
          RouteStore,
          ContactStore,
          BackgroundStore,
          ModalStore
        ]
      });
      context.makePath = makeHomePath;

      var routeStore = context.getStore(RouteStore);
      var appStore = context.getStore(ApplicationStore);
      var contentStore = context.getStore(ContentStore);

      routeStore._handleReceiveRoutes(fluxibleRoutes);
      routeStore._handleNavigateStart(routes.home);
      routeStore._handleNavigateSuccess(routes.home);
      appStore.updatePageTitle({ title: 'test' });
      contentStore.receivePageContent(homePage);

      appElement = React.createElement(fluxibleApp.getComponent(), {
        context: context
      });
    });

    it('should render home content', function (done) {
      var app, components;

      // Get composite component in document
      app = testUtils.renderIntoDocument(appElement);

      components = testUtils.scryRenderedDOMComponentsWithClass(app, 'page-content');

      // 'Home' content comes from service-data, not the real doc
      expect(components[0].textContent).to.match(/Home/i);

      settle(50, done);
    });

    it('should render home navigation', function (done) {
      var app, component;

      app = testUtils.renderIntoDocument(appElement);

      // throws if not exactly 1
      component = testUtils.findRenderedDOMComponentWithClass(app, 'selected');

      expect(component.textContent).to.match(/Home/i);

      settle(50, done);
    });
  });
});
