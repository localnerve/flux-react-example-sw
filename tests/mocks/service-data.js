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
    var result;

    if (params.emulateError) {
      callback(new Error('mock'));
    }

    switch (params.resource) {
      case 'routes':
        result = callback(null, {
          models: undefined,
          content: JSON.parse(JSON.stringify(routesResponse))
        });
      break;

      case 'business':
        result = callback(null, 'business fixture goes here');
      break;

      case 'about':
        result = callback(null, {
          models: models,
          content: '<h2>About</h2>'
        });
      break;

      case 'contact':
        result = callback(null, {
          models: models,
          content: '<h2>Contact</h2>'
        });
      break;

      case 'home':
        result = callback(null, {
          models: models,
          content: '<h2>Home</h2>'
        });
      break;

      case 'settings':
        result = callback(null, {
          models: models,
          content: '<h2>Settings</h2>'
        });
      break;

      default:
        throw new Error('service-data test mock recieved unexpected resource request');
    }

    return result;
  },

  initialize: function (callback) {
    callback();
  },

  update: function (callback) {
    callback();
  }
};
