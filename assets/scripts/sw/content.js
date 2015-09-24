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
 * Store the content separately if the app is online.
 */
function storeOnlineContent (payload) {
  return fetch('/beacon').then(function (response) {
    if (response.ok) {
      return idb.put('init', 'content', payload.ContentStore);
    }
    throw new Error('Beacon not online');
  });
}

/**
 * Pull the resource request from the given request url.
 * Return the content response for that resource.
 *
 * TODO: populate 'init' with another key to store the initial content.
 * Why? because an offline reload will cause the ContentStore to update
 * with a new initial content set - which will omit/replace the original online initial rendered
 * set.
 * Look that content set up instead of the 'init' 'stores' ContentStore.
 * Call it 'init' 'content'.
 * The key? ONLY store that content set if online.
 *
 * @param {String} request - the request url to find the resource in.
 * @return {Object} A promise that resolves to the Response with the initial content.
 */
function resourceContentResponse (request) {
  var matches = request.match(/resource=([\w\-]+)/);
  var resource = matches && matches[1];

  if (resource) {
    return idb.get('init', 'content').then(function (payload) {
      var content = payload && payload.contents && payload.contents[resource];

      debug(toolbox.options, 'resourceContentResponse, resource:', resource, 'response:', content);

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
