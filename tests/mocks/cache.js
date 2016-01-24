/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var routesResponse = require('../fixtures/routes-response');

module.exports = {
  get: function (resource) {
    var result = 'hello world'; // ref: mocks/superagent.js defaultResponse

    if (resource === 'routes') {
      return routesResponse;
    }


    if (resource === 'miss') {
      result = undefined;
    }
    return result;
  },
  put: function () {}
};
