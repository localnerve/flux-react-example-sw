/**
 * Copyright 2015, Alex Grant, LocalNerve, LLC.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Mock responses for the subscription service.
 */
'use strict';

var allTopics = [{
  label: 'Alerts',
  tag: 'push-alerts-tag'
}, {
  label: 'Upcoming Events',
  tag: 'push-upcoming-events-tag'
}];

var updateTopic = [{
  label: 'Alerts',
  tag: 'push-alerts-tag',
  subscribe: true
}];

module.exports = {
  updateTopic: updateTopic,
  topics: allTopics,
  read: function read (params, config, callback) {
    var err;
    if (params.emulateError) {
      err = new Error('mock');
    }
    callback(err, allTopics);
  },
  create: function create (params, body, config, callback) {
    console.log('subscription:create', params, body);
  },
  update: function update (params, body, config, callback) {
    console.log('subscription:update', params, body);
    var err;
    if (params.emulateError) {
      err = new Error('mock');
    }
    // just send update back
    callback(err, body.topics);
  },
  delete: function (params, config, callback) {
    var err;
    if (params.emulateError) {
      err = new Error('mock');
    }
    callback(err);
  }
};
