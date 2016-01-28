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
var responseDelay;

function fetch (request) {
  return new Promise(function (resolve, reject) {
    var response = mockResponse || new Response({
      mock: 'body'
    }, {
      status: 200
    });

    if (emulateError) {
      if (responseDelay) {
        setTimeout(reject, responseDelay, new Error('mock error'));
        return;
      }
      return reject(new Error('mock error'));
    }

    if (responseDelay) {
      setTimeout(resolve, responseDelay, response);
      return;
    }
    return resolve(response);
  });
}

module.exports = {
  fetch: fetch,
  setMockResponse: function (response) {
    mockResponse = response;
  },
  setEmulateError: function (err) {
    emulateError = err;
  },
  setResponseDelay: function (delay) {
    responseDelay = delay;
  }
};
