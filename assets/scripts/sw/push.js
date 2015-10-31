/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Install push message handler.
 */
/* global self, fetch */
'use strict';

var debug = require('./utils/debug')('push');
var toolbox = require('sw-toolbox');

// FIXME: Get correct payload url.
// send the subscriptionId and event.timestamp as a parameter too.
var payloadUrl = '/_api/push';

/**
 * Handle push messages.
 * Retrieves the message payload and shows the notification.
 */
self.addEventListener('push', function (event) {
  debug(toolbox.options, 'Received a push message', event);

  event.waitUntil(

    fetch(payloadUrl).then(function (response) {
      debug(toolbox.options, 'Received push payload response', response);

      if (response.status !== 200) {
        throw new Error('Push payload response error, status' + response.status);
      }

      response.json().then(function (data) {
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

        self.registration.showNotification(title, options);
      });
    }).catch(function (error) {
      debug(toolbox.options, 'Failed to get push payload', error);

      return self.registration.showNotification('An error occurred', {
        body: 'Failed to get push payload from ' + payloadUrl,
        icon: '/public/images/android-chrome-192x192.png',
        tag: 'notification-error'
      });
    })
  );
});

/**
 * Handle push message notification clicks.
 */
self.addEventListener('notificationclick', function (event) {
  debug(toolbox.options, 'Received a notification click', event);

  // TODO:
  // navigate to the page:
  //   event.notification.data.url
});
