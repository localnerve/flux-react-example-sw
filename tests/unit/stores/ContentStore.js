/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, beforeEach */
'use strict';

var expect = require('chai').expect;
var ContentStore = require('../../../stores/ContentStore');

describe('content store', function () {
  var storeInstance;
  var content1 = {
    resource: 'home',
    content: '<h2>home</h2>'
  };

  beforeEach(function () {
    storeInstance = new ContentStore();
  });

  it('should instantiate correctly', function () {
    expect(storeInstance).to.be.an('object');
    expect(storeInstance.currentResource).to.equal('');
    expect(storeInstance.contents).to.be.empty;    
  });

  it('should receive page content', function () {
    storeInstance.receivePageContent(content1);
    expect(Object.keys(storeInstance.contents).length).to.equal(1);
  });

  it('should reject malformed page content', function () {
    storeInstance.receivePageContent({ foo: 'bar' });
    expect(Object.keys(storeInstance.contents).length).to.equal(0);
  });

  it('should get content by resource', function () {
    storeInstance.receivePageContent(content1);
    expect(storeInstance.get(content1.resource)).to.equal(content1.content);
  });

  it('should get the current content', function () {
    storeInstance.receivePageContent(content1);
    expect(storeInstance.getCurrentPageContent()).to.eql(content1.content);
  });

  it('should dehydrate', function () {
    storeInstance.receivePageContent(content1);
    var state = storeInstance.dehydrate();
    
    expect(state.resource).to.equal(content1.resource);
    expect(Object.keys(state.contents).length).to.equal(1);
    expect(state.contents[state.resource]).to.eql(content1.content);
  });

  it('should rehydrate', function () {
    var state = {
      resource: content1.resource,
      contents: { home: content1.content }
    };

    storeInstance.rehydrate(state);

    expect(storeInstance.currentResource).to.equal(state.resource);
    expect(Object.keys(storeInstance.contents).length).to.equal(1);
    expect(storeInstance.get(state.resource)).to.eql(content1.content);
  });
});