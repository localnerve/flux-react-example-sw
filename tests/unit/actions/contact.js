/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, beforeEach */
'use strict';

var expect = require('chai').expect;

var createMockActionContext = require('fluxible/utils').createMockActionContext;
var MockService = require('fluxible-plugin-fetchr/utils/MockServiceManager');
var ContactStore = require('../../../stores/ContactStore');
var serviceMail = require('../../fixtures/service-mail');
var contactAction = require('../../../actions/contact');

describe('contact action', function () {
  var context;
  
  var fields = {
    name: 'alex',
    email: 'alex@test.domain',
    message: 'the truth about seafood is it\'s people'
  };

  beforeEach(function () {
    context = createMockActionContext({
      stores: [ ContactStore ]
    });
    context.service = new MockService();
    context.service.setService('contact', function (method, params, config, callback) {
      serviceMail.send(params, callback);
    });
  });

  it('should update the ContactStore with one field', function (done) {
    var partialFields = {
      email: fields.email
    };
    context.executeAction(contactAction, { fields: partialFields }, function (err) {
      if (err) {
        return done(err);
      }

      var contactFields = context.getStore(ContactStore).getContactFields();

      expect(contactFields.name).to.equal('');
      expect(contactFields.email).to.deep.equal(partialFields.email);
      expect(contactFields.message).to.equal('');
      done();
    });
  });

  it('should update the ContactStore with all fields', function (done) {
    context.executeAction(contactAction, { fields: fields }, function (err) {
      if (err) {
        return done(err);
      }

      var contactFields = context.getStore(ContactStore).getContactFields();

      expect(contactFields).to.deep.equal(fields);
      done();
    });    
  });

  it('should send and clear the ContactStore when complete, success', function (done) {
    context.executeAction(contactAction, { fields: fields, complete: true }, function (err) {
      if (err) {
        return done(err);
      }

      var contactFields = context.getStore(ContactStore).getContactFields();

      expect(contactFields.name).to.equal('');
      expect(contactFields.email).to.equal('');
      expect(contactFields.message).to.equal('');
      done();
    });    
  });

  it.skip('should update the ContactStore and send when complete, handle failure', function (done) {
  });
});