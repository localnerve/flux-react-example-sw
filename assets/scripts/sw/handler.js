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
  init: init,
  dumpCache: dumpCache
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

// This is just for dumpCache
var helpers = require('sw-toolbox/lib/helpers');
/**
 * Dump cache governed by sw-toolbox.
 *
 * TODO: this is just for debugging, make conditional soon
 */
function dumpCache () {
  helpers.openCache().then(function (cache) {
    cache.keys().then(function (keys) {
      console.log('[sw-toolbox] cache');
      keys.forEach(function (key) {
        cache.match(key).then(function (value) {
          console.log('[sw cache] key:', key, ' value:', value);
        });
      });
    });
  });
}

/**
 * Handle unknown commands
 */
function unknownCommand (payload, responder) {
  responder({
    error: 'Unknown command received by service worker.'
  });
}

module.exports = function run (command, payload, responder) {
  var handler = commands[command] || unknownCommand;
  return handler(payload, responder);
};
