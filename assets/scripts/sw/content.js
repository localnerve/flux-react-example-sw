/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Various handling for content
 */
/* global Promise, Response, Blob, fetch */
'use strict';

var toolbox = require('sw-toolbox');
var debug = require('./debug')('content');
var idb = require('./idb');

/**
 * Update the init content (must be stored/addressed separately from init stores)
 * if the app is online.
 *
 * @param {Object} payload - The initial stores payload.
 * @return {Object} A Promise.
 */
function storeOnlineContent (payload) {
  return fetch('/beacon').then(function (response) {
    if (response.ok) {
      return idb.put('init', 'content', payload.ContentStore);
    }
    throw response;
  }).catch(function (error) {
    debug(toolbox.options, 'App not online, not updating init.content', error);
  });
}

/**
 * Pull the resource request from the given request url.
 * Return the content response for that resource.
 *
 * Uses IndexedDB init content to retrieve the initially served content.
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
    return idb.get('init', 'content').then(function (payload) {
      var content = payload && payload.contents && payload.contents[resource];

      debug(toolbox.options, 'resourceContentResponse, resource:', resource, ', response:', content);

      return new Promise(function (resolve, reject) {
        if (content) {
          var blob = new Blob([JSON.stringify(content)], {
            type: 'application/json'
          });
          resolve(new Response(blob));
        } else {
          resolve();
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
  resourceContentResponse: resourceContentResponse,
  storeOnlineContent: storeOnlineContent
};
