/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * TODO: change to use fixture (to be created) with content responses.
 *   Really needed for settings.json and contact.json.
 */
'use strict';

var routesResponse = require('../fixtures/routes-response');
var modelsResponse = require('../fixtures/models-response');

module.exports = {
  createContent: function (input) {
    var content = typeof input === 'string' ? '<h2>'+input+'</h2>'
      : input;

    return {
      models: modelsResponse,
      content: content
    };
  },
  fetch: function (params, callback) {
    var result;

    if (params.emulateError) {
      return callback(new Error('mock'));
    }

    if (params.noData) {
      return callback();
    }

    switch (params.resource) {
      case 'routes':
        result = callback(null, {
          models: undefined,
          content: JSON.parse(JSON.stringify(routesResponse))
        });
      break;

      case 'about':
        result = callback(null, this.createContent('About'));
      break;

      case 'contact':
        result = callback(null, this.createContent('Contact'));
      break;

      case 'home':
        result = callback(null, this.createContent('Home'));
      break;

      case 'settings':
        result = callback(null, this.createContent({
          pushNotifications: {
            topics: [{
              label: 'Alerts',
              tag: 'push-alerts-tag'
            }, {
              label: 'Upcoming Events',
              tag: 'push-upcoming-events-tag'
            }]
          }
        }));
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
