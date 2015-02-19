/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, before, beforeEach */
'use strict';

require('node-jsx').install({ extension: '.jsx' });

// var expect = require('chai').expect;
var React = require('react/addons');

var ApplicationStore = require('../../../stores/ApplicationStore');
var MockContext = require('fluxible/utils/MockComponentContext')();
var fluxibleApp = require('../../../app');
var testDom = require('../../helpers/testdom');

MockContext.Dispatcher.registerStore(ApplicationStore);

describe('application component', function() {
  var AppFactory, appElement, context, testUtils;
/*  
  var homeRoute = {
    params: { key: 'home' },
    config: { page: 'Home' }
  };
*/
  before(function() {
    AppFactory = fluxibleApp.getAppComponent();
    testUtils = React.addons.TestUtils;
  });

  beforeEach(function() {
    context = new MockContext();
    appElement = AppFactory({
      context: context
    });
    testDom();
  });

  it('should do render hello world heading');
/*
    , function() {   
    var app = testUtils.renderIntoDocument(appElement);
    var appStore = context.getStore(ApplicationStore);
    appStore.handleNavigate(homeRoute);

    var component = testUtils.findRenderedDOMComponentWithTag(app, 'h1');
    expect(component.getDOMNode().textContent).to.match(/hello world/i);
  });
*/
});