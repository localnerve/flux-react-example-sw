/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Handlers to fulfill service worker message commands.
 */
'use strict';

var toolbox = require('sw-toolbox');
var backgrounds = require('./backgrounds');
var routes = require('./routes');
var idb = require('./idb');
var content = require('./content');
var debug = require('./debug')('handler');

var commands = {
  init: init
};

/**
 * Handle the 'init' command.
 *
 * It uses the initial store data sent from the server to setup dynamic request
 * handling, and to keep the store data up-to-date.
 *
 * Gets executed every app load (once per session).
 * Gets executed at the beginning of service worker start.
 *
 * Installs background and route fetch handling.
 * Precaches backgrounds and routes.
 * Updates the initial stores and content stored in IndexedDB.
 *
 * @param {Object} payload - Initial store state
 * @param {Function} responder - Function to call to resolve the message
 */
function init (payload, responder) {
  debug(toolbox.options, 'init command handler');

  idb.put('init', 'stores', payload)
  .then(function () {
    return content.storeOnlineContent(payload);
  })
  .then(function () {
    return backgrounds(payload);
  })
  .then(function () {
    return routes(payload);
  })
  .then(function () {
    responder({
      error: null
    });
  })
  .catch(function (error) {
    debug(toolbox.options, 'init failed', error);
    responder({
      error: error.toString()
    });
  });
}

/**
 * Handle unknown commands
 *
 * @param {Object} payload - Initial store state
 * @param {Function} responder - Function to call to resolve the message
 */
function unknownCommand (payload, responder) {
  responder({
    error: 'Unknown command received by service worker.'
  });
}

/**
 * Run a command
 */
module.exports = function run (command, payload, responder) {
  var handler = commands[command] || unknownCommand;
  return handler(payload, responder);
};
