/**
 * Copyright 2015, Alex Grant, LocalNerve, LLC.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var routesResponse = require('./routes-response');

module.exports = {
  fetch: function(params, callback) {
    if (params.emulateError) {
      callback(new Error('mock'));
    }

    switch (params.resource) {
      case 'routes':
        callback(null, JSON.parse(JSON.stringify(routesResponse)));
        break;

      case 'business':
        callback(null, 'business fixture goes here');
        break;

      case 'about':
      case 'contact':
      case 'home':
        callback(null, '<h2>Some Markup Here</h2>');
        break;

      default:
        throw new Error('service-data test fixture recieved unexpected resource request');
    }
  }
};