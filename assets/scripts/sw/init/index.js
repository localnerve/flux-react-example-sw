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
var stores = require('./stores');
var debug = require('../utils/debug')('init');

/**
 * Run the 'init' sequence.
 *
 * Uses the initial store data sent from the server to setup dynamic request
 * handling, and to keep the store data up-to-date if the app is online.
 *
 * When?
 * 1. Gets executed every new app load (once per session), via message.
 * 2. Gets executed at the beginning of service worker start, via load.
 * So can run multiple times, *must be idempotent*.
 *
 * What?
 * 1. Updates the init.stores in IndexedDB if the app is online.
 * 2. Installs background and route fetch handling.
 * 3. Precaches backgrounds and routes.
 *
 * @param {Object} payload - Initial store state
 * @param {Function} responder - Function to call to resolve the message
 */
function init (payload, responder) {
  debug(toolbox.options, 'Running init');

  stores.updateInitStores(payload)
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
 * Expose the init command and public stores methods.
 */
module.exports = {
  command: init,
  getStores: stores.readInitStores,
  resourceContentResponse: stores.resourceContentResponse
};
