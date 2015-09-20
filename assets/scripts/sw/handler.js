/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Handlers to fulfill service worker message commands.
 */
'use strict';

var backgrounds = require('./backgrounds');
var routes = require('./routes');

var commands = {
  init: init
};

/**
 * Handle init command.
 * Gets executed every app load (once per session).
 * Installs background and route fetch handling, additional precaching.
 *
 * @param {Object} payload - Initial store state
 * @param {Function} responder - Function to call to resolve the message
 */
function init (payload, responder) {
  console.log('[sw handler] init command');

  backgrounds(payload).then(function () {
    routes(payload).then(function () {
      responder({
        error: null
      });
    });
  }).catch(function (error) {
    responder({
      error: error
    });
  });
}

/**
 * Handle unknown commands
 */
function unknownCommand (payload, responder) {
  responder({
    error: '[sw handler] Unknown command received by service worker.'
  });
}

module.exports = function run (command, payload, responder) {
  var handler = commands[command] || unknownCommand;
  return handler(payload, responder);
};
