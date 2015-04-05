/**
 * Copyright 2015, Alex Grant, LocalNerve, LLC.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var mockery = require('mockery');
var serviceData = require('../fixtures/service-data');

function mockServiceDataBegin() {
  mockery.registerMock('./data', serviceData);
  mockery.enable({
    useCleanCache: true,
    warnOnUnregistered: false
  });
}

function mockServiceDataEnd() { 
  mockery.deregisterMock('./data');
  mockery.disable();
}

module.exports = {
  serviceData: {
    begin: mockServiceDataBegin,
    end: mockServiceDataEnd
  }
};