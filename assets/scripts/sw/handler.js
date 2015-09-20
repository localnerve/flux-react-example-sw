/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Handlers to fulfill service worker message commands.
 */
'use strict';

var okResult = {
  error: null
};

var commands = {
  init: init
};

/**
 * Handle init command
 *
 * TODO:
 * 1. Fetch and cache main routes so every main route is up-to-date and works offline.
 * 2. Setup background fetches on proper origin. This should install prefetching.
 */
function init (payload, responder) {
  console.log('[sw handler] init command');

  responder(okResult);
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
