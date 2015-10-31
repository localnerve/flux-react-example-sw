/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * A Yahoo fetchr service definition for sending push messages.
 */
'use strict';

var webPush = require('web-push');
var pushConfig = require('../configs').create().push;

module.exports = {
  name: 'push',

  /**
   * Push one or more messages to subscribers.
   * For now, this just pushes a single, canned message to a single subscriber.
   *
   * If topics were given, and this was protected, this could be used to send
   * messages to the entire subscriber base.
   *
   * @param {Object} req - Not used.
   * @param {String} resource - Not used.
   * @param {Object} params - subscriptionId, endpoint.
   * @param {Object} body - Not used.
   * @param {Object} config - Not used.
   * @param {Function} callback - The callback to execute on completion.
   */
  create: function (req, resource, params, body, config, callback) {
    webPush.setGCMAPIKey(pushConfig.service.apiKey());

    return webPush.sendNotification(params.endpoint).then(function () {
      callback();
    }).catch(function (error) {
      callback(error);
    });
  },

  /**
   * Supply the payload for a push message.
   * For now, this just supplies a single, canned payload for demo purpose.
   *
   * @param {Object} req - Not used.
   * @param {String} resource - Not used.
   * @param {Object} params - subscriptionId, timestamp.
   * @param {Object} config - Not used.
   * @param {Function} callback - called upon completion with push payload.
   */
  read: function(req, resource, params, config, callback) {
    return callback(null, {
      title: 'Contactor Demo Message',
      message: 'Try out the contact page!',
      icon: '/public/images/android-chrome-192x192.png',
      tag: 'contactor-push-notification-payload',
      // get the external application origin from config?
      url: 'http://localhost:3000/contact'
    });
  }

  // update: function(resource, params, body, config, callback) {},
  // delete: function(resource, params, config, callback) {}
};
