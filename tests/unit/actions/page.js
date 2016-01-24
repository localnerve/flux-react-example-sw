/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, beforeEach */
'use strict';

var expect = require('chai').expect;

var createMockActionContext = require('fluxible/utils').createMockActionContext;
var MockService = require('fluxible-plugin-fetchr/utils/MockServiceManager');
var ApplicationStore = require('../../../stores/ApplicationStore');
var ContentStore = require('../../../stores/ContentStore');
var pageAction = require('../../../actions/page');
var serviceData = require('../../mocks/service-data');

describe('page action', function () {
  var context;
  var params = {
    resource: 'home',
    pageTitle: 'happy time home page'
  };

  beforeEach(function () {
    context = createMockActionContext({
      stores: [ApplicationStore, ContentStore]
    });
    context.service = new MockService();
    context.service.setService('page', function (method, params, config, callback) {
      serviceData.fetch(params, callback);
    });
  });

  it('should update the ApplicationStore', function (done) {
    context.executeAction(pageAction, params, function (err) {
      if (err) {
        return done(err);
      }

      var title = context.getStore(ApplicationStore).getCurrentPageTitle();

      expect(title).to.be.a('string').and.not.be.empty;
      done();
    });
  });

  it('should update the ContentStore', function (done) {
    context.executeAction(pageAction, params, function (err) {
      if (err) {
        return done(err);
      }

      var content = context.getStore(ContentStore).getCurrentPageContent();

      expect(content).to.be.a('string').and.not.be.empty;
      done();
    });
  });
});
