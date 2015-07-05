/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global afterEach, describe, it, before, beforeEach */
'use strict';

require('node-jsx').install({ extension: '.jsx' });

var expect = require('chai').expect;
var React = require('react/addons');
var ApplicationStore = require('../../../stores/ApplicationStore');
var BackgroundStore = require('../../../stores/BackgroundStore');
var HtmlComponent = require('react')
  .createFactory(require('../../../components/Html.jsx'));
var createMockComponentContext = require('fluxible/utils').createMockComponentContext;
// HtmlComponent never renders on the client, so dont make dom until test render
var testDom = require('../../utils/testdom');

describe('html component', function () {
  var testUtils;
  var htmlComponent;

  var testProps = {
    images: 'path/to/images',
    mainScript: 'path/to/mainScript',
    trackingSnippet: 'someTrackingCode',
    headerStyles: '@charset "UTF-8";',
    headerScript: 'window["MyTest"] = 0;',
    state: '123456789',
    markup: 'Hello World'
  };

  before(function () {
    testUtils = React.addons.TestUtils;
  });

  beforeEach(function () {
    testProps.context = createMockComponentContext({
      stores: [ApplicationStore, BackgroundStore]
    });
    htmlComponent = HtmlComponent(testProps);

    // This enables dom render after HtmlComponent factory call.
    // This mimics what really happens.
    testDom.start();
  });

  afterEach(function () {
    // Remove the dom for the next HtmlComponent factory call.
    testDom.stop();
  });

  it('should render a header style', function () {
    var html = testUtils.renderIntoDocument(htmlComponent);
    var component = testUtils.findRenderedDOMComponentWithTag(html, 'style');
    expect(component.getDOMNode().textContent).to.equal(testProps.headerStyles);
  });

  it('should render a title', function () {
    var html = testUtils.renderIntoDocument(htmlComponent);
    var component = testUtils.findRenderedDOMComponentWithTag(html, 'title');
    expect(component.getDOMNode().textContent).to.be.empty;
  });

  it('should render a section', function () {
    var html = testUtils.renderIntoDocument(htmlComponent);
    var component = testUtils.findRenderedDOMComponentWithTag(html, 'section');
    expect(component.getDOMNode().textContent).to.equal(testProps.markup);
  });

  it('should render multiple scripts', function () {
    var html = testUtils.renderIntoDocument(htmlComponent);
    var component = testUtils.scryRenderedDOMComponentsWithTag(html, 'script');

    expect(component.length).to.equal(4);
    expect(component[0].getDOMNode().textContent).to.equal(testProps.trackingSnippet);
    expect(component[1].getDOMNode().textContent).to.equal(testProps.headerScript);
    expect(component[2].getDOMNode().textContent).to.equal(testProps.state);
    expect(component[3].getDOMNode().textContent).to.be.empty;
    expect(component[3].getDOMNode().getAttribute('src')).to.equal(testProps.mainScript);
  });
});
