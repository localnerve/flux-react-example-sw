/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Handles IndexedDB updates.
 * Only updates init IDBObjectStore if it gets new/first data.
 */
'use strict';

var toolbox = require('sw-toolbox');
var stores = require('./stores');
var apis = require('./apis');
var timestamp = require('./timestamp');
var debug = require('../utils/debug')('init.update');

/**
 * Update the IndexedDB init IDBObjectStore if appropriate.
 *
 * @param {Object} payload - Initial payload
 * @param {Object} payload.stores - The flux stores for the app.
 * @param {Object} payload.apis - The api information for the app.
 * @param {Number} payload.timestamp - The timestamp of the app state.
 * @return {Boolean} A promise that resolves to boolean indicating if init
 * got new data and should run.
 */
module.exports = function update (payload) {
  debug(toolbox.options, 'Running update');

  return timestamp.readInitTimestamp().then(function (currentTs) {
    // If the incoming timestamp is newer, it's on.
    return payload.timestamp && currentTs < payload.timestamp;
  }, function () {
    // No existing timestamp found, so brand new - it's on!
    return true;
  }).then(function (shouldUpdate) {
    if (shouldUpdate) {
      // Update the init.timestamp
      return timestamp.updateInitTimestamp(payload.timestamp)
      .then(function () {
        // Update init.stores
        return stores.updateInitStores(payload.stores);
      })
      .then(function () {
        // Update init.apis
        return apis.updateInitApis(payload.apis).then(function () {
          return true;
        });
      }).catch(function (error) {
        debug(toolbox.options, 'Failed to update', error);
        throw error; // rethrow
      });
    } else {
      return false;
    }
  });
};