/**
 * Copyright 2015, Alex Grant, LocalNerve, LLC.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var routesResponse = require('./routes-response');

module.exports = {
  fetch: function (params, callback) {
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
        callback(null, '<h2>About</h2>');
        break;
      case 'contact':
        callback(null, '<h2>Contact</h2>');
        break;
      case 'home':
        callback(null, '<h2>Home</h2>');
        break;

      default:
        throw new Error('service-data test fixture recieved unexpected resource request');
    }
  },
  initialize: function (callback) {
    callback();
  }
};
