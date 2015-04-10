/**
 * Copyright 2015, Alex Grant, LocalNerve, LLC.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var mockery = require('mockery');
var serviceData = require('../fixtures/service-data');
var superAgent = require('../fixtures/superagent');
var cache = require('../fixtures/cache');
var fetch = require('../fixtures/fetch');

function mockModuleBegin(mocks) {
  mocks.forEach(function(mock) {
    mockery.registerMock(mock.pattern, mock.module);
  });

  mockery.enable({
    useCleanCache: true,
    warnOnUnregistered: false
  });
}

function mockModuleEnd(mocks) {
  mocks.forEach(function(mock) {
    mockery.deregisterMock(mock.pattern);
  });
  
  mockery.disable();
}

function mockServiceDataBegin () {
  mockModuleBegin([{
    pattern: './data',
    module: serviceData
  }]);
}

function mockServiceDataEnd () { 
  mockModuleEnd([{
    pattern: './data'
  }]);
}

function mockSuperAgentBegin () {
  mockModuleBegin([{
    pattern: 'superagent',
    module: superAgent
  }, {
    pattern: './cache',
    module: cache
  }]);
}

function mockSuperAgentEnd () {
  mockModuleEnd([{
    pattern: 'superagent'
  }, {
    pattern: './cache'
  }]);
}

function mockFetchBegin () {
  mockModuleBegin([{
    pattern: './fetch',
    module: fetch
  }, {
    pattern: './cache',
    module: cache
  }]);
}

function mockFetchEnd () {
  mockModuleEnd([{
    pattern: './fetch'
  }, {
    pattern: './cache'
  }]);
}

module.exports = {
  serviceData: {
    begin: mockServiceDataBegin,
    end: mockServiceDataEnd
  },
  superAgent: {
    begin: mockSuperAgentBegin,
    end: mockSuperAgentEnd
  },
  fetch: {
    begin: mockFetchBegin,
    end: mockFetchEnd
  }
};