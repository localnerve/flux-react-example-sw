/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Init message and data handling.
 */
/* global Promise */
'use strict';

var backgrounds = require('./backgrounds');
var routes = require('./routes');
var update = require('./update');
var apiRequests = require('./apiRequests');
var sync = require('../sync');
var stores = require('../utils/db').init({ key: 'stores' });
var apis = require('../utils/db').init({ key: 'apis' });
var timestamp = require('../utils/db').init({ key: 'timestamp' });
var debug = require('../utils/debug')('init');

/**
 * Kick-off the maintenance and synchronization of stored requests.
 * TODO: Use in 'sync' message to handle one-offs synchronization requests.
 * Run here until 'sync' gets more finalized/standardized.
 *
 * @returns {Promise} Resolves to undefined when complete.
 */
function startRequestSync () {
  return sync.serviceAllRequests()
    .then(function (results) {
      results.forEach(function (result) {
        if (result && result.failureCount) {
          debug('TODO: manage abandoned request', result);
        }
      });
    })
    .catch(function (error) {
      debug('serviceAllRequests failed ', error);
    });
}

/**
 * Update stores and setup sw-toolbox route map.
 *
 * @param {Object} payload - Initial payload
 * @param {Number} payload.timestamp - The timestamp of the payload.
 * @param {Object} payload.stores - The flux stores for the app.
 * @param {Object} payload.apis - The api information for the app.
 * @param {Boolean} payload.startup - Indicates the sw started up and memory
 * needs initializing.
 */
function updateAndSetup (payload) {
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
    }
  });
}

/**
 * The 'init' message handler, runs the initialization sequence.
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
 * 1. Synchronizes/Maintains stored requests in IndexedDB.
 * 2. Updates the init.stores in IndexedDB if the app is online.
 * 3. Installs route handlers for sw-toolbox.
 * 4. Precaches/prefetches backgrounds and routes.
 *
 * @param {Object} payload - Initial payload.
 * @param {Function} responder - Function to call to resolve the message.
 */
function init (payload, responder) {
  debug('Running init, payload:', payload);

  return Promise.all([
    startRequestSync(),
    updateAndSetup(payload)
  ])
  .then(function () {
    return responder({
      error: null
    });
  })
  .catch(function (error) {
    debug('init failed', error);
    return responder({
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
  ])
  .then(function (data) {
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
