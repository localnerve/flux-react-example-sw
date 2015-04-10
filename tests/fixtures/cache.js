/**
 * Copyright 2015, Alex Grant, LocalNerve, LLC.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

module.exports = {
  get: function (resource) {
    var result = 'Hello World';
    if (resource === 'miss') {
      result = undefined;
    }
    return result;
  },
  put: function () {}
};