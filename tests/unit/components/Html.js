/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, before, beforeEach */
'use strict';

require('node-jsx').install({ extension: '.jsx' });

var expect = require('chai').expect;
var React = require('react/addons');
var ApplicationStore = require('../../../stores/ApplicationStore');
var HtmlComponent = require('react')
  .createFactory(require('../../../components/Html.jsx'));
var MockContext = require('fluxible/utils/MockComponentContext')();
var testDom = require('../../helpers/testdom');

MockContext.Dispatcher.registerStore(ApplicationStore);

describe('html component', function() {
  var testUtils;
  var htmlComponent;

  var testProps = {
    mainScript: 'path/to/mainScript',
    trackingSnippet: 'someTrackingCode',
    headerStyles: '@charset "UTF-8";',
    state: '123456789',
    markup: 'Hello World'
  };

  before(function() {    
    testUtils = React.addons.TestUtils;
  });

  beforeEach(function() {
    testProps.context = new MockContext();
    htmlComponent = HtmlComponent(testProps);
    testDom();
  });

  it('should render a header style', function() {
    var html = testUtils.renderIntoDocument(htmlComponent);
    var component = testUtils.findRenderedDOMComponentWithTag(html, 'style');
    expect(component.getDOMNode().textContent).to.equal(testProps.headerStyles);
  });

  it('should render a title', function() {
    var html = testUtils.renderIntoDocument(htmlComponent);
    var component = testUtils.findRenderedDOMComponentWithTag(html, 'title');
    expect(component.getDOMNode.textContent).to.be.empty;
  });

  it('should render a section', function() {
    var html = testUtils.renderIntoDocument(htmlComponent);
    var component = testUtils.findRenderedDOMComponentWithTag(html, 'section');
    expect(component.getDOMNode().textContent).to.equal(testProps.markup);
  });

  it('should render multiple scripts', function() {
    var html = testUtils.renderIntoDocument(htmlComponent);
    var component = testUtils.scryRenderedDOMComponentsWithTag(html, 'script');

    expect(component.length).to.equal(3);
    expect(component[0].getDOMNode().textContent).to.equal(testProps.trackingSnippet);
    expect(component[1].getDOMNode().textContent).to.equal(testProps.state);
    expect(component[2].getDOMNode().textContent).to.be.empty;
    expect(component[2].getDOMNode().getAttribute('src')).to.equal(testProps.mainScript);
  });
});