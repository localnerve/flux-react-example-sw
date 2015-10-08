/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Various handling for api info saved in IndexedDB 'init.apis' ObjectStore.
 */
/* global Promise */
'use strict';

var toolbox = require('sw-toolbox');
var debug = require('../utils/debug')('init.apis');
var idb = require('../utils/idb');
var keyName = 'apis';

/**
 * Update IndexedDB init.apis.
 * This updates the api info for different apis used by the app, incl. CSRF tokens.
 *
 * @param {Object} apis - The new Apis payload.
 * @return {Promise} A Promise that resolves to the result of idb.put.
 */
function updateInitApis (apis) {
  debug(toolbox.options, 'Updating init.apis');
  return idb.put(idb.stores.init, keyName, apis);
}

/**
 * Read IndexedDB init.apis
 *
 * @return {Promise} A Promise that resolves to the apis Object.
 */
function readInitApis () {
  return idb.get(idb.stores.init, keyName).then(function (apis) {
    return new Promise(function (resolve, reject) {
      if (apis) {
        debug(toolbox.options, 'successfully read init.apis');
        resolve(apis);
      } else {
        debug(toolbox.options, 'init.apis not found');
        reject();
      }
    });
  });
}

module.exports = {
  readInitApis: readInitApis,
  updateInitApis: updateInitApis
};
