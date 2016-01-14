/**
 * Copyright 2015, Alex Grant, LocalNerve, LLC.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Mock idb for sw/utils/db
 */
/* global Promise */
'use strict';

module.exports = {
  stores: {
    init: 'init',
    requests: 'requests'
  },
  emulateError: function (error) {
    this.error = error;
  },
  get: function (storeName, keyName) {
    var testValue;

    if (!this.error) {
      testValue = 'test value';
    }

    return Promise.resolve(testValue);
  },
  put: function (storeName, keyName, value) {
    if (this.error) {
      return Promise.reject(new Error('mock error'));
    }

    return Promise.resolve();
  }
};