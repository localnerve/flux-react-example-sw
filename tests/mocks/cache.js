/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var routesResponse = require('../fixtures/routes-response');

var calledFind;
var calledGet;
var calledPut;

module.exports = {
  mockReset: function () {
    calledFind = calledGet = calledPut = 0;
    delete this.findValue;
  },
  mockCounts: function () {
    return {
      find: calledFind,
      get: calledGet,
      put: calledPut
    };
  },

  find: function (resource) {
    calledFind++;
    return this.findValue;
  },
  get: function (resource) {
    calledGet++;
    var result = 'hello world'; // ref: mocks/superagent.js defaultResponse

    if (resource === 'routes') {
      delete this.findValue;
      return routesResponse;
    }

    if (resource === 'find') {
      this.findValue = result;
      result = undefined;
    }

    if (resource === 'miss') {
      delete this.findValue;
      result = undefined;
    }

    return result;
  },
  put: function () {
    calledPut++;
  }
};
