/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it, before, beforeEach */
'use strict';
var expect = require('chai').expect;
var MockContext = require('fluxible/utils/MockActionContext')();
//var MockService = require('fluxible-plugin-fetchr/utils/MockServiceManager');
var ApplicationStore = require('../../../stores/ApplicationStore');
var routes = require('../../../actions/routes');
var routesResponse = require('../../fixtures/routes-response');
var toFluxibleRoutes = require('../../../utils/transformers').toFluxibleRoutes;

MockContext.Dispatcher.registerStore(ApplicationStore);

describe('routes action', function () {
  var context;
  var response;

  before(function() {
    // clone the routesResponse so we don't disrupt it.
    var clone = JSON.parse(JSON.stringify(routesResponse));
    response = toFluxibleRoutes(clone);
  });

  beforeEach(function () {
    context = new MockContext();
/*    
    context.service = new MockService();
    context.service.setService('routes', function (method, params, config, callback) {
      if (params.emulateError) {
        return callback(new Error('Things went sour.'));
      }

      callback(null, routesResponse);
    });
*/
  });

  it('should update the ApplicationStore', function (done) {
    var params = {
      routes: response
    };

    context.executeAction(routes, params, function (err) {
      if (err) {
        return done(err);
      }

      var pages = context.getStore(ApplicationStore).getPages();
      expect(pages).to.be.an('object');

      done();
    });
  });

});