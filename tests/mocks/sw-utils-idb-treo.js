/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Mock treo for sw/utils/idb
 */
'use strict';

var closeCount = 0;
var mockValue;
var mockReporter;

function TreoStoreMock () {}
['all', 'batch', 'del', 'get', 'put'].forEach(function (method) {
  TreoStoreMock.prototype[method] = function () {
    var lastTwoArgs = Array.prototype.slice.call(arguments, -2),
        cb = lastTwoArgs[1] || lastTwoArgs[0],
        test = lastTwoArgs[0];

    // error emulation is a little specific/funky for this
    if (test === 'emulateError') {
      return cb(new Error('mock error'));
    }

    if (mockReporter) {
      mockReporter.apply(mockReporter,
        [method].concat(Array.prototype.slice.call(arguments)));
    }

    cb(null, mockValue || 'mock value');
  };
});

function TreoDBMock () {
  closeCount = 0;
}
TreoDBMock.prototype = {
  close: function () {
    closeCount++;
  },
  store: function () {
    return new TreoStoreMock();
  }
};

function TreoMock () {
  return new TreoDBMock();
}
TreoMock.schema = function treoMockSchema () {
  return {
    version: function () {
      return {
        addStore: function () {}
      };
    }
  };
};

/***
 * Mock only methods and properties
 */
TreoMock.status = {
  getCloseCount: function () {
    return closeCount;
  }
};
TreoMock.setValue = function (value) {
  mockValue = value;
};
TreoMock.getValue = function () {
  return mockValue;
};
TreoMock.setReporter = function (reporter) {
  mockReporter = reporter;
};

module.exports = TreoMock;
