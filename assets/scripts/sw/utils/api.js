/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Module to contain api specific helper methods.
 * For this example, these are specific to Yahoo Fetchr, and relate to
 * the data formats therein.
 * Hopefully, this file stays small and/or can be eliminated at some point.
 */
'use strict';

/**
 * Create a Fetchr formatted content response.
 * Fetchr special format requirement: GH/yahoo/fetchr/issues/127
 *
 * @param {Object} content - JSON parsed content response.
 * @returns {Object} A plain Object of a response in Fetchr compliant format.
 */
function createContentResponse (content) {
  return {
    data: content
  };
}

/**
 * Create a formatted request state with a Fetchr formatted body.
 *
 * @param {Object} xhrContext - A Fetchr api xhrContext object.
 * @param {Object} state - Object containing request state information.
 * @param {Object} state.body - The Fetchr request body.
 * @param {String} state.operation - The REST op (create, read, update, delete).
 * @param {Object} state.params - The Fetchr request params.
 * @param {String} state.resource - The resource Fetchr should access.
 * This is defined in the Fetchr service interface as a 'name'.
 * @returns {Object} A Fetchr request formatted as a plain Object.
 */
function createRequestBody (xhrContext, state) {
  return {
    context: xhrContext,
    requests: {
      g0: {
        body: state.body,
        operation: state.operation,
        params: state.params,
        resource: state.resource
      }
    }
  };
}

var csrfTokenPropertyName = '_csrf';

/**
 * Get the CSRF token from an xhrContext object.
 *
 * @param {Object} xhrContext - The Fetchr xhrContext to search.
 * @returns {String} The token if found, undefined otherwise.
 */
function getCSRFTokenFromContext (xhrContext) {
  return xhrContext[csrfTokenPropertyName];
}

/**
 * Replace the CSRF Token in a request body, if defined.
 *
 * @param {Object} body - The Fetchr request body.
 * @param {String} csrfToken - The new CSRF Token to use.
 * @returns {Boolean} True if replaced, false otherwise.
 */
function replaceCSRFTokenInRequestBody (body, csrfToken) {
  if (body.context && body.context[csrfTokenPropertyName]) {
    body.context[csrfTokenPropertyName] = csrfToken;
    return true;
  }
  return false;
}

/**
 * Create a Fetchr xhrContext from a given response text.
 *
 * @param {String} text - The text to search.
 * @returns {Object} A Fetchr xhrContext.
 * @throws An Error if unsuccessful.
 */
function createXHRContextFromText (text) {
  var re = new RegExp(csrfTokenPropertyName+'\"\:\s*\"([^\"]+)', 'ig'),
      m = re.exec(text);

  if (m && m[1]) {
    var xhrContext = {};
    xhrContext[csrfTokenPropertyName] = m[1];
    return xhrContext;
  }

  throw new Error('CSRF Token not found in text');
}

module.exports = {
  createContentResponse: createContentResponse,
  createRequestBody: createRequestBody,
  getCSRFTokenFromContext: getCSRFTokenFromContext,
  replaceCSRFTokenInRequestBody: replaceCSRFTokenInRequestBody,
  createXHRContextFromText: createXHRContextFromText,
  CSRFTokenPropertyName: csrfTokenPropertyName
};
