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

var ApplicationStore = require('../../../stores/ApplicationStore');
var createMockComponentContext = require('fluxible/utils').createMockComponentContext;
var fluxibleApp = require('../../../app');
var React = require('react/addons');

describe('application component', function() {
  var AppFactory, appElement, context, testUtils;

  var homeRoute = {
    params: { key: 'home' },
    config: { page: 'home' }
  };

  function makeHomePath() {
    return '/';
  }

  before(function() {
    AppFactory = fluxibleApp.getComponent();
    testUtils = React.addons.TestUtils;
  });

  beforeEach(function() {
    context = createMockComponentContext({
      stores: [ApplicationStore]
    });
    context.makePath = makeHomePath;
    appElement = AppFactory({
      context: context
    });    
    testDom();
  });

  it.skip('should render hello world heading', function() {
    var appStore = context.getStore(ApplicationStore);
    var app = testUtils.renderIntoDocument(appElement);
    
    // update state
    appStore.handleNavigate(homeRoute);

    var component = testUtils.findRenderedDOMComponentWithTag(app, 'h2');
    expect(component.getDOMNode().textContent).to.match(/hello world/i);
  });

  it.skip('should render navigation', function() {
    var appStore = context.getStore(ApplicationStore);
    var app = testUtils.renderIntoDocument(appElement);
    
    // update state
    appStore.handleNavigate(homeRoute);

    // throws if not exactly 1
    testUtils.findRenderedDOMComponentWithTag(app, 'ul');
  });
});