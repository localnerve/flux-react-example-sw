/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, beforeEach, afterEach */
'use strict';

var expect = require('chai').expect;
var ApplicationStore = require('../../../stores/ApplicationStore');
var Immutable = require('immutable');

describe('application store', function () {
  var storeInstance;
  var homeRoute = Immutable.fromJS({
    page: 'home'
  });

  beforeEach(function () {
    storeInstance = new ApplicationStore();
  });

  it('should instantiate correctly', function () {
    expect(storeInstance).to.be.an('object');
    expect(storeInstance.currentPageName).to.equal(null);
    expect(storeInstance.currentPageTitle).to.equal('');
  });

  it('should update page title', function () {
    var page = { title: 'Fluxible Rocks' };
    storeInstance.updatePageTitle(page);
    expect(storeInstance.getCurrentPageTitle()).to.equal(page.title);
  });

  it('should update page name', function () {
    storeInstance.handleNavigate(homeRoute);
    expect(storeInstance.getCurrentPageName()).to.equal(homeRoute.get('page'));
  });

  it('should dehydrate', function () {
    storeInstance.handleNavigate(homeRoute);
    var page = { title: 'Fluxible Rocks' };
    storeInstance.updatePageTitle(page);

    var state = storeInstance.dehydrate();

    expect(state.pageName).to.equal(homeRoute.get('page'));
    expect(state.pageTitle).to.equal(page.title);
  });

  it('should rehydrate', function () {
    var page = { title: 'Fluxible Rocks' };
    var state = {
      pageName: homeRoute.get('page'),
      pageTitle: page.title
    };

    storeInstance.rehydrate(state);

    expect(storeInstance.getCurrentPageName()).to.equal(homeRoute.get('page'));
    expect(storeInstance.getCurrentPageTitle()).to.equal(page.title);
  });

  describe('special case change', function () {
    var onChange;

    function makeError (done) {
      function error () {
        done('should not have emitted change');
      }
      onChange = error;
      return error;
    }

    afterEach(function () {
      if (onChange) {
        storeInstance.removeChangeListener(onChange);
        onChange = null;
      }
    });

    it('should not change if only page title update', function (done) {
      storeInstance.addChangeListener(makeError(done));
      setTimeout(done, 50);
      storeInstance.updatePageTitle({ title: 'Fluxible Rocks' });
    });

    it('should not change if only page name update', function (done) {
      storeInstance.addChangeListener(makeError(done));
      setTimeout(done, 50);
      storeInstance.handleNavigate(homeRoute);
    });

    it('should change only if both title and name update', function (done) {
      function success () {
        done();
      }
      onChange = success;
      storeInstance.addChangeListener(success);
      storeInstance.updatePageTitle({ title: 'Fluxible Rocks' });
      storeInstance.handleNavigate(homeRoute);
    });
  });
});
