/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Handlers to fulfill service worker message commands.
 */
/* global Promise */
'use strict';

var backgrounds = require('./backgrounds');
var routes = require('./routes');
var update = require('./update');
var apiRequests = require('./apiRequests');
var stores = require('../utils/db').init({ key: 'stores' });
var apis = require('../utils/db').init({ key: 'apis' });
var timestamp = require('../utils/db').init({ key: 'timestamp' });
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
 * 2. Installs background fetch handling.
 * 3. Installs api request fetch handling.
 * 4. Installs route fetch handling.
 * 5. Precaches/prefetches backgrounds and routes.
 *
 * TODO: Add sync.serviceAllRequests to maintain deferred api requests (#15).
 *
 * @param {Object} payload - Initial payload
 * @param {Number} payload.timestamp - The timestamp of the payload.
 * @param {Object} payload.stores - The flux stores for the app.
 * @param {Object} payload.apis - The api information for the app.
 * @param {Boolean} payload.startup - Indicates the sw started up and memory
 * needs initializing.
 * @param {Function} responder - Function to call to resolve the message
 */
function init (payload, responder) {
  debug('Running init, payload:', payload);

  return update(payload).then(function (updated) {
    if (updated || payload.startup) {
      return backgrounds(payload.stores)
        .then(function () {
          return apiRequests(payload.apis);
        })
        .then(function () {
          return routes(payload.stores);
        });
    } else {
      debug('init skipped');
      return Promise.resolve();
    }
  })
  .then(function () {
    responder({
      error: null
    });
  })
  .catch(function (error) {
    debug('init failed', error);
    responder({
      error: error.toString()
    });
  });
}

/**
 * Reads all the stored init data.
 *
 * @return {Promise} A Promise that resolves to a Object with the init payload.
 */
function initData () {
  return Promise.all([
    stores.read(),
    apis.read(),
    timestamp.read()
  ]).then(function (data) {
    return {
      stores: data[0],
      apis: data[1],
      timestamp: data[2]
    };
  });
}

/**
 * Expose the init command and public storage access for init things.
 */
module.exports = {
  command: init,
  data: initData
};
