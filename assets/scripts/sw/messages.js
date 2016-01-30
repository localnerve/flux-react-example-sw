/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Message handling for the service worker.
 */
/* global Promise, self, clients */
'use strict';

// For now, this only works in dev builds, sw-toolbox issue #31
var debug = require('./utils/debug')('messages');

/***
 * Add any new messaging command handlers to this object.
 * All commands must accept arguments payload, responder and return Promise.
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
  return responder({
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
  var result,
      respondTo = event.data.port || event.source;

  if (respondTo) {
    respondTo.postMessage(response);
  } else {
    if (self.clients) {
      result = clients.matchAll().then(function (clients) {
        for (var i = 0; i < clients.length; i++) {
          clients[i].postMessage(response);
        }
      });
    }
  }

  return result || Promise.resolve();
}

self.addEventListener('message', function (event) {
  var commandName = event.data.command,
      payload = event.data.payload,
      command = commands[commandName] || unknownCommand,
      handler = 'waitUntil' in event ? event.waitUntil : function () {};

  debug('\'' + commandName + '\' command received', payload);

  handler(
    command(payload, sendResponse.bind(this, event))
  );
});
