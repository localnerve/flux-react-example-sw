/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, beforeEach */
'use strict';

var expect = require('chai').expect;
var ModalStore = require('../../../stores/ModalStore');

describe('modal store', function () {
  var storeInstance;
  var payload = {
    props: {
      content: 'hello'
    },
    component: 'Settings'
  };

  beforeEach(function () {
    storeInstance = new ModalStore();
  });

  it('should instantiate correctly', function () {
    expect(storeInstance).to.be.an('object');
    expect(storeInstance.isOpen).to.equal(false);
    expect(storeInstance.component).to.equal('');
    expect(storeInstance.props).to.be.an('object').that.is.empty;
  });

  describe('start', function () {
    it('should update component', function () {
      storeInstance.startModal(payload);
      expect(storeInstance.getComponent()).to.equal(payload.component);
    });

    it('should update props', function () {
      storeInstance.startModal(payload);
      expect(storeInstance.getProps()).to.equal(payload.props);
    });

    it('should update isOpen', function () {
      storeInstance.startModal(payload);
      expect(storeInstance.getIsOpen()).to.equal(true);
    });
  });

  describe('stop', function () {
    it('should update isOpen', function () {
      storeInstance.startModal(payload);
      expect(storeInstance.getIsOpen()).to.equal(true);
      storeInstance.stopModal();
      expect(storeInstance.getIsOpen()).to.equal(false);
    });
  });

  it('should dehydrate', function () {
    storeInstance.startModal(payload);

    var state = storeInstance.dehydrate();

    expect(state.isOpen).to.equal(true);
    expect(state.component).to.equal(payload.component);
    expect(state.props).to.eql(payload.props);
  });

  it('should rehydrate', function () {
    var state = {
      isOpen: false,
      component: payload.component,
      props: payload.props
    };

    storeInstance.rehydrate(state);

    expect(storeInstance.getIsOpen()).to.equal(false);
    expect(storeInstance.getComponent()).to.equal(payload.component);
    expect(storeInstance.getProps()).to.eql(payload.props);
  });
});
