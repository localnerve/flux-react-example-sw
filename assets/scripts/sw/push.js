/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Install push message handler.
 */
/* global self, fetch, clients */
'use strict';

var debug = require('./utils/debug')('push');
var toolbox = require('sw-toolbox');
var requests = require('./utils/requests');
var pushUtil = require('../../../utils/push');

var pushUrl = '/_api/push';

/**
 * Retrieve the push data payload from the pushUrl endpoint, and show the
 * notification.
 *
 * @param {Number} timestamp - epoch time of the message event.
 * @returns {Promise} Allows event to complete when fulfilled.
 */
function getPayloadAndShowNotification (timestamp) {
  return self.registration.pushManager.getSubscription()
  .then(function (subscription) {
    var payloadUrl = requests.addOrReplaceUrlSearchParameter(
      pushUrl, 'subscriptionId', pushUtil.getSubscriptionId(subscription)
    );
    payloadUrl = requests.addOrReplaceUrlSearchParameter(
      payloadUrl, 'timestamp', timestamp
    );

    return fetch(payloadUrl).then(function (response) {
      debug(toolbox.options, 'Received push payload response', response);

      if (response.status !== 200) {
        throw new Error('Push payload response error, status' + response.status);
      }

      return response.json().then(function (data) {
        debug(toolbox.options, 'Received push payload data', data);

        var title = data.title;
        var options = {
          body: data.message,
          icon: data.icon,
          tag: data.tag,
          data: {
            url: data.url
          }
        };

        return self.registration.showNotification(title, options);
      });
    }).catch(function (error) {
      debug(toolbox.options, 'Failed to get push payload', error);

      return self.registration.showNotification('An error occurred', {
        body: 'Failed to get push payload from ' + payloadUrl,
        icon: '/public/images/android-chrome-192x192.png',
        tag: 'notification-error'
      });
    });
  });
}

/**
 * Handle push messages.
 * Retrieves the message payload and shows the notification.
 */
self.addEventListener('push', function (event) {
  debug(toolbox.options, 'Received a push message', event);

  event.waitUntil(
    getPayloadAndShowNotification(event.timeStamp || Date.now())
  );
});

/**
 * Handle push message notification clicks.
 */
self.addEventListener('notificationclick', function (event) {
  debug(toolbox.options, 'Received a notification click', event);

  var url = event.notification.data.url;

  event.notification.close();

  event.waitUntil(
    clients.matchAll({
      type: 'window'
    }).then(function (windowClients) {
      if (windowClients.length > 0) {
        windowClients[0].postMessage({
          command: 'navigate',
          url: url
        });
        return windowClients[0].focus();
      } else {
        return clients.openWindow(url);
      }
    })
  );
});
