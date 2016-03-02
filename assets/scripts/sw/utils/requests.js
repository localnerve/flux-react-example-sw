/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Module to contain request handling operations.
 *
 * TODO:
 * URL should be used instead of so many string hacks, but requires jsdom
 * update to test.
 */
/* global Request, Blob */
'use strict';

/**
 * Adds or replaces a query string parameter to the given url.
 *
 * @param {String} url - The url to operate on.
 * @param {String} name - The name of the search parameter.
 * @param {String} value - The value of the search parameter.
 * @return {String} The updated url with the new name, value search parameter.
 */
function addOrReplaceUrlSearchParameter(url, name, value) {
  var newUrl, reName = new RegExp('('+name+'=)([^&]+)');

  // replace/add the name/value parameter in the url.
  if (reName.test(url)) {
    newUrl = url.replace(reName, '$1'+value);
  } else {
    var search = url.split('?');
    url = url.replace(/\?$/, '');
    newUrl = url + ( search[1] ? '&' : '?' );
    newUrl += [name, value].join('=');
  }

  return newUrl;
}

/**
 * strip search!
 *
 * Removes the search/query portion from a URL.
 * E.g. stripSearchParameters("https://example.com/index.html?a=b&c=d")
 *     ➔ "https://example.com/index.html"
 *
 * @param {String} url - the url of a request.
 * @return {String} A url with the entire query string removed.
 */
function stripSearchParameters(url) {
  return url.replace(/\?(?:.*)$/, '');
}

/**
 * Add or update a cache busting parameter to the given URL.
 *
 * @param {String} url - The url to add or update the cache busting parameter.
 * @return {String} A url with the cache busting parameter added or updated.
 */
function cacheBustRequest (url) {
  return addOrReplaceUrlSearchParameter(url, 'sw-cache', Date.now());
}

/**
 * Utility method to dehydrate a Request to a plain object for IDBObjectStore.
 *
 * @private
 *
 * @param {Request} request - The input Request object.
 * @param {String} bodyType - One of the Request Body methods: arrayBuffer,
 * blob, json, text, or formData
 * @return {Promise} Promise resolves to dehydrated request state.
 */
function dehydrateRequest (request, bodyType) {
  var bodyGetter = request[bodyType];

  return bodyGetter.call(request).then(function (body) {
    return {
      method: request.method,
      url: request.url,
      bodyType: bodyType,
      body: body
    };
  });
}

/**
 * Utility method to rehydrate a Request from a plain object from IDBObjectStore.
 *
 * @private
 *
 * @param {Object} state - The dehydrated request state.
 * @param {String} state.url - The request url.
 * @param {String} state.method - The request method.
 * @param {String} state.bodyType - Must be 'json'.
 * @param {Object} state.body - The request body.
 * @param {Object} [state.body.context] - The request body context.
 * @param {Object} [apiInfo] - contains timeout, cors, and CSRF token to use.
 * If specified, any existing csrf value in the request state url is replaced,
 * or a new key/value is added to the end of the url.
 * @param {Object} [apiInfo.xhrContext] - contains csrfToken.
 * @param {String} [apiInfo.xhrContext._csrf] - The csrfToken.
 * @return {Request} A new Request object from state.
 */
function rehydrateRequest (state, apiInfo) {
  var body, url, csrfName = '_csrf';

  var csrfToken = apiInfo.xhrContext[csrfName];

  // If csrfToken specified, add/replace one in the body and url
  if (csrfToken) {
    url = addOrReplaceUrlSearchParameter(state.url, csrfName, csrfToken);

    // replace/add the csrfToken in the body.
    if (state.body.context && state.body.context[csrfName]) {
      state.body.context[csrfName] = csrfToken;
    }
  }

  // Only supporting json bodyType for this app.
  if (state.bodyType === 'json') {
    body = new Blob([JSON.stringify(state.body)], {
      type: 'application/json'
    });
  }

  return new Request (url, {
    method: state.method,
    body: body,
    credentials: 'include'
  });
}

module.exports = {
  dehydrateRequest: dehydrateRequest,
  rehydrateRequest: rehydrateRequest,
  cacheBustRequest: cacheBustRequest,
  stripSearchParameters: stripSearchParameters,
  addOrReplaceUrlSearchParameter: addOrReplaceUrlSearchParameter
};
