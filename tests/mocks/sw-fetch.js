/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * A simple mock for service worker exposed global fetch method.
 */
/* global Promise */
'use strict';

var Response = require('./response');

var whichCall = 0;
var mockResponse = [false];
var emulateError = [false];
var responseDelay = [0];

function fetch (request) {
  return new Promise(function (resolve, reject) {
    var response = mockResponse[whichCall] || new Response({
      mock: 'body'
    }, {
      status: 200
    });

    var error = emulateError[whichCall];
    var delay = responseDelay[whichCall];

    // Only count calls if it is expected.
    if ((mockResponse.length-1) > whichCall ||
        (emulateError.length-1) > whichCall ||
        (responseDelay.length-1) > whichCall) {
      whichCall++;
    }

    if (error) {
      if (delay) {
        setTimeout(reject, delay, new Error('mock error'));
        return;
      }
      return reject(new Error('mock error'));
    }

    if (delay) {
      setTimeout(resolve, delay, response);
      return;
    }
    return resolve(response);
  });
}

module.exports = {
  fetch: fetch,
  /**
   * Setup a mock response.
   *
   * @param {Object} response - A mock response object. If undefined, use default
   * response, clears any previously defined mock responses, resets whichCall.
   * @param {Number} whichFetch - Which fetch call in a sequence the mock
   * response should be used for.
   */
  setMockResponse: function (response, whichFetch) {
    if (!response && typeof whichFetch === 'undefined') {
      whichCall = 0;
      mockResponse = [false];
    } else {
      mockResponse[whichFetch || 0] = response;
    }
  },
  /**
   * Setup a mock fetch error.
   *
   * @param {Boolean} err - If truthy, throw a mock error. Otherwise, no error,
   * clears any previously defined errors, resets whichCall.
   * @param {Number} whichFetch - Which fetch call in a sequence the error should
   * be thrown for.
   */
  setEmulateError: function (err, whichFetch) {
    if (!err && typeof whichFetch === 'undefined') {
      whichCall = 0;
      emulateError = [false];
    } else {
      emulateError[whichFetch || 0] = err;
    }
  },
  /**
   * Setup a mock response delay.
   *
   * @param {Number} delay - A ms delay. 0 also means no delay applied at all.
   * @param {Number} whichFetch - Which fetch call in a sequence the delay should
   * be used for.
   */
  setResponseDelay: function (delay, whichFetch) {
    if (!delay && typeof whichFetch === 'undefined') {
      whichCall = 0;
      responseDelay = [0];
    } else {
      responseDelay[whichFetch || 0] = delay;
    }
  },
  /**
   * Reset all mock settings.
   */
  reset: function () {
    this.setMockResponse();
    this.setEmulateError();
    this.setResponseDelay();
  }
};
