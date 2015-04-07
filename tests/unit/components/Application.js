/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, before, beforeEach */
'use strict';

require('node-jsx').install({ extension: '.jsx' });

var expect = require('chai').expect;

var testDom = require('../../utils/testdom');
// This is an isomorphic component, so for testing, prepare to load react with dom here
testDom();

var createMockComponentContext = require('fluxible/utils').createMockComponentContext;

var ApplicationStore = require('../../../stores/ApplicationStore');
var ContentStore = require('../../../stores/ContentStore');
var serviceData = require('../../fixtures/service-data');
var routesResponse = require('../../fixtures/routes-response');
var fluxibleRoutes = require('../../fixtures/fluxible-routes');
var fluxibleApp = require('../../../app');

var React = require('react');
var ReactAddons = require('react/addons');

describe('application component', function() {
  var appElement, context, testUtils;

  var homeRoute = {
    params: { key: 'home' },
    config: routesResponse.home
  };
  var homePage = {
    resource: routesResponse.home.action.params.resource
  };

  function makeHomePath() {
    return '/';
  }

  before(function() {
    testUtils = ReactAddons.addons.TestUtils;

    serviceData.fetch(homePage, function(err, content) {
      if (err) {
        throw err;
      }
      homePage.content = content;
    });
  });

  beforeEach(function() {
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

    testDom();
  });

  it('should render home content', function() {
    var app = testUtils.renderIntoDocument(appElement);

    var component = testUtils.findRenderedDOMComponentWithClass(app, 'page-content');

    expect(component.getDOMNode().textContent).to.match(/Home/i);
  });

  it('should render navigation', function() {
    var app = testUtils.renderIntoDocument(appElement);

    // throws if not exactly 1
    testUtils.findRenderedDOMComponentWithTag(app, 'ul');
  });
});