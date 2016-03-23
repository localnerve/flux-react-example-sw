/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Overrides load and save for visionmedia/debug, using IndexedDB.
 */
'use strict';

var idb = require('./idb');
var debugLib = require('debug');
// debugLib.storage is undefined, but made irrelevant by this module.
// debugLib.load has run and failed silently in the visionmedia/debug module.

var key = 'debug';

/**
 * Override debugLib load.
 *
 * @returns {Promise} Resolves to undefined when complete.
 */
debugLib.load = function workerDebugLoad () {
  return idb.get(idb.stores.state, key);
};

/*jshint unused:true, eqnull:true */
/**
 * Override debugLib save.
 *
 * @returns {Promise} Resolves to undefined when complete.
 */
debugLib.save = function workerDebugSave (namespaces) {
  if (namespaces == null) {
    return idb.del(idb.stores.state, key)
    .catch(function () {
      // silent failure
    });
  }

  return idb.put(idb.stores.state, key, namespaces)
  .catch(function (error) {
    console.error('debug failed to save namespace', error);
  });
};

/***
 * Echo the functionality of debugLib.
 * On module load, enable from storage.
 */
debugLib.load().then(function (namespaces) {
  debugLib.enable(namespaces);
});

/**
 * Wrap the main debugLib function
 *
 * @param {String} namespace
 * @returns {Function} The debug function for chaining.
 */
function debugWrapper (namespace) {
  return debugLib('sw:'+namespace);
}

// Mixin all debugLib props and methods
for (var item in debugLib) {
  if (debugLib.hasOwnProperty(item)) {
    debugWrapper[item] = debugLib[item];
  }
}

module.exports = debugWrapper;
