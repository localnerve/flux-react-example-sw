/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * A Yahoo fetchr service definition for sending push messages.
 */
'use strict';

var webPush = require('web-push');
var pushConfig = require('../configs').create().push;
var error = require('./error');

module.exports = {
  name: 'push',

  /**
   * Push one or more messages to subscribers.
   * Maybe. But for now, this just pushes a notification to a single subscriber
   * for demo purposes.
   *
   * For example, if topics were given, and this was protected, this could be
   * used to send messages to the entire subscriber base.
   *
   * It is more likely that this will never be used as a notification trigger.
   * It would be more convenient (and secure) to have a worker monitoring the
   * actual message sources, queue the payloads by topic and trigger the
   * notifications to the registered subscribers by topic.
   *
   * @param {Object} req - Not used.
   * @param {String} resource - Not used.
   * @param {Object} params - subscriptionId, endpoint.
   * @param {Object} body - Not used, topics?.
   * @param {Object} config - Not used.
   * @param {Function} callback - The callback to execute on completion.
   */
  create: function (req, resource, params, body, config, callback) {
    webPush.setGCMAPIKey(pushConfig.service.apiKey());

    return webPush.sendNotification(params.endpoint).then(function () {
      callback();
    }).catch(function (err) {
      callback(error(err));
    });
  },

  /**
   * Supply the payload for a push message.
   * For now, this just supplies a single, canned payload for demo purpose.
   *
   * In a real app, this would lookup the message in the subscribed topic queues,
   * and return the one that matches closest to the timestamp (yuck).
   * Its a *bummer* we cannot send the data or even a topic in the first place.
   *
   * Timestamp is not good enough. About the best you can do is infer after a
   * timeperiod an order of which message goes with which payload request, and
   * even that is no guarantee.
   * Since there is no sure way to match a request with the intended message,
   * suspending #33.
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
      url: '/contact'
    });
  }

  // update: function(resource, params, body, config, callback) {},
  // delete: function(resource, params, config, callback) {}
};
