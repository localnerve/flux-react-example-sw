/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global afterEach, describe, it, beforeEach */
'use strict';

require('node-jsx').install({ extension: '.jsx' });

var expect = require('chai').expect;
var testUtils = require('react-addons-test-utils');
var ApplicationStore = require('../../../stores/ApplicationStore');
var BackgroundStore = require('../../../stores/BackgroundStore');
var HtmlComponent = require('react')
  .createFactory(require('../../../components/Html.jsx'));
var createMockComponentContext = require('fluxible/utils').createMockComponentContext;
// HtmlComponent never renders on the client, so dont make dom until test render
var testDom = require('../../utils/testdom');

// Temporarily skipping due to React 0.14 html component test issue #5128
describe.skip('html component', function () {
  var htmlComponent;

  var testProps = {
    images: 'path/to/images',
    mainScript: 'path/to/mainScript',
    trackingSnippet: 'someTrackingCode',
    headerStyles: '@charset "UTF-8";',
    headerScript: 'window["MyTest"] = 0;',
    state: '123456789',
    markup: 'Hello World',
    appManifest: 'path/to/manifest.json',
    browserConfig: 'path/to/browserConfig.xml',
    swRegistrationScript: 'path/to/service-worker-registration.js',
    swMainScript: 'service-worker.js'
  };

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
    expect(component.textContent).to.equal(testProps.headerStyles);
  });

  it('should render a title', function () {
    var html = testUtils.renderIntoDocument(htmlComponent);
    var component = testUtils.findRenderedDOMComponentWithTag(html, 'title');
    expect(component.textContent).to.be.empty;
  });

  it('should render a section', function () {
    var html = testUtils.renderIntoDocument(htmlComponent);
    var component = testUtils.findRenderedDOMComponentWithTag(html, 'section');
    expect(component.textContent).to.equal(testProps.markup);
  });

  it('should render multiple scripts', function () {
    var html = testUtils.renderIntoDocument(htmlComponent);
    var component = testUtils.scryRenderedDOMComponentsWithTag(html, 'script');

    expect(component.length).to.equal(5);
    expect(component[0].textContent).to.equal(testProps.trackingSnippet);
    expect(component[1].getAttribute('src')).to.equal(testProps.swRegistrationScript);
    expect(component[1].getAttribute('data-service-worker')).to.equal(testProps.swMainScript);
    expect(component[2].textContent).to.equal(testProps.headerScript);
    expect(component[3].textContent).to.equal(testProps.state);
    expect(component[4].textContent).to.be.empty;
    expect(component[4].getAttribute('src')).to.equal(testProps.mainScript);
  });
});
