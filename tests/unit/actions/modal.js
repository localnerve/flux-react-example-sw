/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, before, after, beforeEach, afterEach */
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
  var mockActions, calledService, context, params;

  before(function () {
    mockActionInterface.begin();
    mockActions = require('./interface');
  });

  after(function () {
    mockActionInterface.end();
  });

  beforeEach(function () {
    calledService = 0;
    params = JSON.parse(JSON.stringify(modelsResponse.Settings));
    context = createMockActionContext({
      stores: [ModalStore, ContentStore]
    });
    context.service = new MockService();
    context.service.setService('page', function (method, params, config, callback) {
      calledService++;
      serviceData.fetch(params, callback);
    });
  });

  afterEach(function () {
    delete mockActions.test;
  });

  describe('start', function () {
    var expectedError = new Error('should have received an error');

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

    it('should not make service call if data in ContentStore', function (done) {
      var contentStore = context.getStore(ContentStore);

      // make sure content for params.resource is there
      if (!contentStore.get(params.resource)) {
        contentStore.receivePageContent({
          resource: params.resource,
          data: serviceData.createContent(params.resource)
        });
      }

      context.executeAction(modalStartAction, params, function (err) {
        if (err) {
          return done(err);
        }

        var models = contentStore.getCurrentPageModels();

        expect(models).to.eql(modelsResponse);
        expect(calledService).to.equal(0);
        done();
      });
    });

    it('should handle customAction failure after service call',
    function (done) {
      var calledAction = 0,
          localParams = Object.assign({}, params);

      mockActions.test = function (context, payload, done) {
        calledAction++;
        payload.emulateError = true;
        return mockActions.settings(context, payload, done);
      };
      localParams.action = {
        name: 'test',
        params: {}
      };

      context.executeAction(modalStartAction, localParams, function (err) {
        expect(calledService).to.equal(1);
        expect(calledAction).to.equal(1);

        if (err) {
          return done();
        }

        done(expectedError);
      });
    });

    it('should handle customAction failure no service call', function (done) {
      var calledAction = 0,
          contentStore = context.getStore(ContentStore);

      // make sure content for params.resource is there
      if (!contentStore.get(params.resource)) {
        contentStore.receivePageContent({
          resource: params.resource,
          data: serviceData.createContent(params.resource)
        });
      }

      var localParams = Object.assign({}, params);
      mockActions.test = function (context, payload, done) {
        calledAction++;
        payload.emulateError = true;
        return mockActions.settings(context, payload, done);
      };
      localParams.action = {
        name: 'test',
        params: {}
      };

      context.executeAction(modalStartAction, localParams, function (err) {
        expect(calledService).to.equal(0);
        expect(calledAction).to.equal(1);

        if (err) {
          return done();
        }

        done(expectedError);
      });
    });

    it('should fail as expected', function (done) {
      context.executeAction(modalStartAction, {
        emulateError: true
      }, function (err) {
        if (err) {
          return done();
        }

        done(expectedError);
      });
    });

    it('should fail as expected with no data', function (done) {
      context.executeAction(modalStartAction, {
        noData: true
      }, function (err) {
        if (err) {
          return done();
        }

        done(expectedError);
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
