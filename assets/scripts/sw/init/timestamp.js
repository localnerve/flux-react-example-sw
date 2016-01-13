/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Handling for timestamp saved in IndexedDB 'init.timestamp' ObjectStore.
 */
/* global Promise */
'use strict';

var debug = require('../utils/debug')('init.timestamp');
var idb = require('../utils/idb');
var keyName = 'timestamp';

/**
 * Update IndexedDB init.timestamp.
 *
 * @param {Number} timestamp - The new timestamp.
 * @return {Promise} The result of the idb put.
 */
function updateInitTimestamp (timestamp) {
  debug('Updating init.timestamp');
  return idb.put(idb.stores.init, keyName, timestamp);
}

/**
 * Read IndexedDB init.timestamp
 *
 * @return {Promise} A Promise that resolves to the timestamp.
 */
function readInitTimestamp () {
  return idb.get(idb.stores.init, keyName).then(function (timestamp) {
    return new Promise(function (resolve, reject) {
      if (timestamp) {
        debug('successfully read init.timestamp');
        resolve(timestamp);
      } else {
        debug('init.timestamp not found');
        reject();
      }
    });
  });
}

module.exports = {
  readInitTimestamp: readInitTimestamp,
  updateInitTimestamp: updateInitTimestamp
};
