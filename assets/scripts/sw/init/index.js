/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Handlers to fulfill service worker message commands.
 */
/* global Promise */
'use strict';

var toolbox = require('sw-toolbox');
var backgrounds = require('./backgrounds');
var routes = require('./routes');
var stores = require('./stores');
var apis = require('./apis');
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
 * @param {Object} payload - Initial payload
 * @param {Object} payload.stores - The flux stores for the app.
 * @param {Object} payload.apis - The api information for the app.
 * @param {Function} responder - Function to call to resolve the message
 */
function init (payload, responder) {
  debug(toolbox.options, 'Running init, payload:', payload);

  stores.updateInitStores(payload.stores)
  .then(function () {
    return apis.updateInitApis(payload.apis);
  })
  .then(function () {
    return backgrounds(payload.stores);
  })
  .then(function () {
    return routes(payload.stores);
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
 * Reads all the stored init data.
 *
 * @returns A promise that resolves to a Object with the init data:
 * { stores: <stores>, apis: <apis> }
 */
function initData () {
  return Promise.all([
    stores.readInitStores(),
    apis.readInitApis()
  ]).then(function (data) {
    return {
      stores: data[0],
      apis: data[1]
    };
  });
}

/**
 * Expose the init command and public storage access for init things.
 */
module.exports = {
  command: init,
  data: initData,
  resourceContentResponse: stores.resourceContentResponse
};
