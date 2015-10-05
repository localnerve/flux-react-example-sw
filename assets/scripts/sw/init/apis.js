/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Various handling for api info saved in IndexedDB 'init.apis' ObjectStore.
 */
/* global Promise, fetch */
'use strict';

var toolbox = require('sw-toolbox');
var debug = require('../utils/debug')('init.apis');
var idb = require('../utils/idb');
var keyName = 'apis';

/**
 * Update IndexedDB init.apis only if the app is online.
 * This updates the api info for different apis used by the app, incl. CSRF tokens.
 * Eats any network error and just logs it.
 *
 * @param {Object} payload - The new Apis payload.
 * @return {Object} A Promise, which hides network errors.
 */
function updateInitApis (payload) {
  return fetch('/beacon').then(function (response) {
    if (response.ok) {
      debug(toolbox.options, 'App online, updating init.apis');
      return idb.put(idb.stores.init, keyName, payload);
    }
    throw response;
  }).catch(function (error) {
    debug(toolbox.options, 'App not online, not updating init.apis', error);
  });
}

/**
 * Read IndexedDB init.apis
 *
 * @returns A new promise that simplifies handling and debugging.
 */
function readInitApis () {
  return idb.get(idb.stores.init, keyName).then(function (payload) {
    return new Promise(function (resolve, reject) {
      if (payload) {
        debug(toolbox.options, 'successfully read init.apis');
        resolve(payload);
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
