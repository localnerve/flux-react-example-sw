/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * A simple mock for service worker exposed global fetch method.
 */
/* global Promise */
'use strict';

var Response = require('./response');

var mockResponse;
var emulateError;

function fetch (request) {
  if (emulateError) {
    return Promise.reject(new Error('mock error'));
  }

  return Promise.resolve(mockResponse || new Response({
    mock: 'body'
  }, {
    status: 200
  }));
}

module.exports = {
  fetch: fetch,
  setMockResponse: function (response) {
    mockResponse = response;
  },
  setEmulateError: function (err) {
    emulateError = err;
  }
};
