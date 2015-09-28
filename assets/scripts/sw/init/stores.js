/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Various handling for Flux Stores saved in IndexedDB 'init' ObjectStore.
 */
/* global Promise, Response, Blob, fetch, JSON */
'use strict';

var toolbox = require('sw-toolbox');
var debug = require('../utils/debug')('stores');
var idb = require('../utils/idb');

/**
 * Update IndexedDB init.stores only if the app is online.
 * Eats any network error and just logs it.
 *
 * @param {Object} payload - The initial Flux Stores payload.
 * @return {Object} A Promise, which hides network errors.
 */
function updateInitStores (payload) {
  return fetch('/beacon').then(function (response) {
    if (response.ok) {
      debug(toolbox.options, 'App online, updating init.stores');
      return idb.put('init', 'stores', payload);
    }
    throw response;
  }).catch(function (error) {
    debug(toolbox.options, 'App not online, not updating init.stores', error);
  });
}

/**
 * Read IndexedDB init.stores
 *
 * @returns A new promise that simplifies handling, has base catch, and debugging.
 */
function readInitStores () {
  return idb.get('init', 'stores').then(function (payload) {
    return new Promise(function (resolve, reject) {
      if (payload) {
        debug(toolbox.options, 'successfully read init.stores');
        resolve(payload);
      } else {
        debug(toolbox.options, 'init.stores not found');
        reject();
      }
    });
  });
}
/**
 * Pull the resource request from the given request url and
 * return the content response for that resource (if one exists).
 *
 * Uses IndexedDB init.stores to retrieve the initially served content.
 * @see ./apis.js: handleApiRequest
 *
 * @param {String} request - the request url to find the resource in.
 * @return {Object} A promise that resolves to the Response with the initial
 * content for the resource specified in the request.
 */
function resourceContentResponse (request) {
  var matches = request.match(/resource=([\w\-]+)/);
  var resource = matches && matches[1];

  if (resource) {
    return idb.get('init', 'stores').then(function (payload) {
      var content = payload && payload.ContentStore &&
        payload.ContentStore.contents[resource];

      debug(toolbox.options, 'resourceContentResponse, resource:', resource, ', response:', content);

      return new Promise(function (resolve, reject) {
        if (content) {
          var blob = new Blob([JSON.stringify(content)], {
            type: 'application/json'
          });
          resolve(new Response(blob));
        } else {
          reject();
        }
      });
    });
  }

  // No resource, so Promise resolves to undefined.
  debug(toolbox.options, 'resourceContentResponse: no resource');
  return new Promise(function (resolve) {
    resolve();
  });
}

module.exports = {
  readInitStores: readInitStores,
  resourceContentResponse: resourceContentResponse,
  updateInitStores: updateInitStores
};
