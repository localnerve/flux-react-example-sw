/**
 * Copyright 2015, Alex Grant, LocalNerve, LLC.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Mock treo for sw/utils/idb
 */
'use strict';

var closeCount = 0;

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

    cb(null, 'mock value');
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
TreoMock.status = {
  getCloseCount: function () {
    return closeCount;
  }
},
TreoMock.schema = function treoMockSchema () {
  return {
    version: function () {
      return {
        addStore: function () {}
      };
    }
  };
};

module.exports = TreoMock;
