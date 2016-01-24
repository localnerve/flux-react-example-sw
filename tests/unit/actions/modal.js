/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, before, after, beforeEach */
'use strict';

var expect = require('chai').expect;

var createMockActionContext = require('fluxible/utils').createMockActionContext;
var MockService = require('fluxible-plugin-fetchr/utils/MockServiceManager');
var modelsResponse = require('../../fixtures/models-response');
var ModalStore = require('../../../stores/ModalStore');
var ContentStore = require('../../../stores/ContentStore');
var modalStartAction = require('../../../actions/modal').openModal;
var modalStopAction = require('../../../actions/modal').closeModal;
var modalUpdateAction = require('../../../actions/modal').updateComponent;
var serviceData = require('../../mocks/service-data');
var mockActionInterface = require('../../mocks').interface;

describe('modal action', function () {
  var context, params;

  before(function () {
    mockActionInterface.begin();
  });

  after(function () {
    mockActionInterface.end();
  });

  beforeEach(function () {
    params = JSON.parse(JSON.stringify(modelsResponse.Settings));
    context = createMockActionContext({
      stores: [ModalStore, ContentStore]
    });
    context.service = new MockService();
    context.service.setService('page', function (method, params, config, callback) {
      serviceData.fetch(params, callback);
    });
  });

  describe('start', function () {
    it('should update the ModalStore', function (done) {
      context.executeAction(modalStartAction, params, function (err) {
        if (err) {
          return done(err);
        }

        var modalStore = context.getStore(ModalStore),
            component = modalStore.getComponent(),
            props = modalStore.getProps(),
            isOpen = modalStore.getIsOpen();

        expect(isOpen).to.be.a('boolean').and.equal(true);
        expect(component).to.be.undefined;
        // this is content, models from service-data
        expect(props).to.be.an('object').with.property('content');

        done();
      });
    });

    it('should update the ContentStore', function (done) {
      context.executeAction(modalStartAction, params, function (err) {
        if (err) {
          return done(err);
        }

        var contentStore = context.getStore(ContentStore),
            content = contentStore.getCurrentPageContent(),
            models = contentStore.getCurrentPageModels();

        expect(content).to.exist.and.be.an('object');
        // this is models from fixture
        expect(models).to.eql(modelsResponse);

        done();
      });
    });
  });

  describe('stop', function () {
    it('should update the ModalStore', function (done) {
      context.executeAction(modalStopAction, params, function (err) {
        if (err) {
          return done(err);
        }

        var modalStore = context.getStore(ModalStore),
            isOpen = modalStore.getIsOpen();

        expect(isOpen).to.equal(false);
        done();
      });
    });
  });

  describe('update', function () {
    beforeEach(function () {
      params = {
        resource: 'key',
        component: {
          test: 'hello'
        }
      };
    });

    it('should update component', function (done) {
      context.executeAction(modalUpdateAction, params, function (err) {
        if (err) {
          return done(err);
        }

        var component, modalStore = context.getStore(ModalStore);

        modalStore.modalStart({
          component: params.resource
        });

        component = modalStore.getComponent();

        expect(component).to.eql(params.component);
        done();
      });
    });
  });
});
