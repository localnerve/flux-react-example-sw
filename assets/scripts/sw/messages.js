/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Message handling for the service worker.
 */
/* global self, clients */
'use strict';

// For now, this only works in dev builds, sw-toolbox issue #31
var toolbox = require('sw-toolbox');
var handler = require('./handler');
var debug = require('./debug')('messages');

/**
 * Sends a response back to the message originator.
 * If no source or port, sends to all clients.
 *
 * @param {Object} event - The message event.
 * @param {Object} response - The message response payload.
 */
function sendResponse (event, response) {
  var respondTo = event.data.port || event.source;

  if (respondTo) {
    respondTo.postMessage(response);
  } else {
    if (self.clients) {
      clients.matchAll().then(function (clients) {
        for (var i = 0; i < clients.length; i++) {
          clients[i].postMessage(response);
        }
      });
    }
  }
}

self.addEventListener('message', function (event) {
  var command = event.data.command;
  var payload = event.data.payload;

  debug(toolbox.options, '\'' + command + '\' command received', payload);

  handler(command, payload, sendResponse.bind(this, event));
});
