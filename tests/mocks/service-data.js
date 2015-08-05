/**
 * Copyright 2015, Alex Grant, LocalNerve, LLC.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * TODO: change to use fixture (to be created) with content responses.
 */
'use strict';

var routesResponse = require('../fixtures/routes-response');
var modelsResponse = require('../fixtures/models-response');

var models = modelsResponse;

module.exports = {
  fetch: function (params, callback) {
    if (params.emulateError) {
      callback(new Error('mock'));
    }

    switch (params.resource) {
      case 'routes':
        callback(null, {
          models: undefined,
          content: JSON.parse(JSON.stringify(routesResponse))
        });
        break;

      case 'business':
        callback(null, 'business fixture goes here');
        break;

      case 'about':
        callback(null, {
          models: models,
          content: '<h2>About</h2>'
        });
        break;
      case 'contact':
        callback(null, {
          models: models,
          content: '<h2>Contact</h2>'
        });
        break;
      case 'home':
        callback(null, {
          models: models,
          content: '<h2>Home</h2>'
        });
        break;

      default:
        throw new Error('service-data test mock recieved unexpected resource request');
    }
  },

  initialize: function (callback) {
    callback();
  },

  update: function (callback) {
    callback();
  }
};
