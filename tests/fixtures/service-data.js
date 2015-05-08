/**
 * Copyright 2015, Alex Grant, LocalNerve, LLC.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var routesResponse = require('./routes-response');

// TODO:
// Get these from the backend
var models = {
  LocalBusiness: {
    address: {
      addressCountry: 'USA',
      addressLocality: 'Windham',
      addressRegion: 'ME',
      postOfficeBoxNumber: '95',
      postalCode: '04062',
      streetAddress: 'PO BOX 95'
    },
    alternateName: 'LocalNerve',
    legalName: 'LocalNerve, LLC',
    email: 'alex@localnerve.com',
    telephone: '207-370-8005',
    url: 'http://localnerve.com'
  },
  SiteInfo: {
    developer: {
      byLine: 'Developed by LocalNerve',
      name: 'LocalNerve',
      url: 'http://localnerve.com'
    },
    license: {
      statement: 'All code licensed under LocalNerve BSD License',
      type: 'BSD',
      url: 'http://host/path/to/license.md'
    },
    site: {
      bullets: ['one', 'two', 'three'],
      name: 'ADem-o',
      tagLine: 'A fluxible, react demo'
    },
    social: {
      github: 'http://github.com/localnerve',
      twitter: 'http://twitter.com/localnerve'
    }
  }
};

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
        throw new Error('service-data test fixture recieved unexpected resource request');
    }
  },
  initialize: function (callback) {
    callback();
  }
};
