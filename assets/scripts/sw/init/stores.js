/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Special handling for Flux Stores saved in IndexedDB 'init.stores' ObjectStore.
 */
/* global Promise, Response, Blob, JSON */
'use strict';

var keyName = 'stores';
var debug = require('../utils/debug')('init.stores');
var idb = require('../utils/idb');
var initStores = require('../utils/db').init({ key: keyName });

/**
 * Update IndexedDB init.stores.
 *
 * @param {Object} stores - The initial Flux Stores payload.
 * @return {Promise} A Promise that resolves to the result of idb.put.
 */
function updateInitStores (stores) {
  debug('Updating init.stores');
  return mergeContent(stores).then(function (merged) {
    return initStores.update(merged);
  });
}

/**
 * Keep old ContentStore content if it does not exist in newStores.
 * This is used by resourceContentResponse
 * @see resourceContentResponse
 *
 * NOTE: This grows the content over time. There is not currently a purging
 * mechanism.
 * TODO: Add IndexedDB purge to activate.
 *
 * @param {Object} newStores - The newer version of Flux Store data.
 * @return {Promise} A Promise that resolves to the new data merged with old content.
 */
function mergeContent (newStores) {
  return idb.get(idb.stores.init, keyName).then(function (oldStores) {
    if (newStores && oldStores) {
      var oldContent = oldStores.ContentStore.contents;
      var newContent = newStores.ContentStore.contents;

      Object.keys(oldContent).forEach(function (resource) {
        // If the content is missing in newStores, it lives on.
        if (!newContent[resource]) {
          newContent[resource] = oldContent[resource];
        }
      });
    }

    return Promise.resolve(newStores);
  });
}

/**
 * Pull the resource request from the given request url and
 * return the content response for that resource (if one exists).
 *
 * Uses IndexedDB init.stores to retrieve the initially served content.
 * @see apiRequests.js
 *
 * @param {String} request - the request url to find the resource in.
 * @return {Object} A promise that resolves to the Response with the initial
 * content for the resource specified in the request.
 */
function resourceContentResponse (request) {
  var matches = request.match(/resource=([\w\-]+)/);
  var resource = matches && matches[1];

  if (resource) {
    return idb.get(idb.stores.init, keyName).then(function (payload) {
      var content = payload && payload.ContentStore &&
        payload.ContentStore.contents[resource];

      debug('resourceContentResponse, resource:', resource, ', response:', content);

      return new Promise(function (resolve, reject) {
        if (content) {
          // Fetchr special format requirement: GH/yahoo/fetchr/issues/127
          var fetchrFormat = {
            data: content
          };
          var blob = new Blob([JSON.stringify(fetchrFormat)], {
            type: 'application/json'
          });
          resolve(new Response(blob));
        } else {
          reject(new Error('Content not found for resource: ' + resource));
        }
      });
    });
  }

  // No resource, so Promise resolves to undefined.
  debug('resourceContentResponse: no resource');
  return Promise.resolve();
}

module.exports = {
  resourceContentResponse: resourceContentResponse,
  updateInitStores: updateInitStores
};
