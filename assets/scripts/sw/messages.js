/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Message handling for the service worker.
 */
/* global self, clients */
'use strict';

// For now, this only works in dev builds, sw-toolbox issue #31
var debug = require('./utils/debug')('messages');

/**
 * Add any new messaging command handlers to this object.
 *
 * Signature: command (payload, responder)
 * All commands must accept arguments payload, responder.
 * The payload is the message payload object, and responder is a function that
 * accepts a single object that contains an optional error property.
 */
var commands = {
  init: require('./init').command
};

/**
 * Handle unknown commands
 *
 * @param {Object} payload - Ignored.
 * @param {Function} responder - Function to call to resolve the message
 */
function unknownCommand (payload, responder) {
  responder({
    error: 'Unknown command received by service worker.'
  });
}

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

  debug('\'' + command + '\' command received', payload);

  var handler = commands[command] || unknownCommand;
  handler(payload, sendResponse.bind(this, event));
});
