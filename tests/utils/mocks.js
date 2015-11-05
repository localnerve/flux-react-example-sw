/**
 * Copyright 2015, Alex Grant, LocalNerve, LLC.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Mockery and mock manager
 */
'use strict';

var mockery = require('mockery');
var debug = require('debug')('Test:Mocks');
var serviceData = require('../mocks/service-data');
var serviceMail = require('../mocks/service-mail');
var serviceSubscription = require('../mocks/service-subs');
var superAgent = require('../mocks/superagent');
var amqplib = require('../mocks/amqplib');
var cache = require('../mocks/cache');
var fetch = require('../mocks/fetch');
var queue = require('../mocks/queue');
var mailer = require('../mocks/mailer');
var actionInterface = require('../mocks/actionInterface');

function mockModuleBegin (mocks) {
  mocks.forEach(function (mock) {
    debug('registering mock "' + mock.pattern + '"');
    mockery.registerMock(mock.pattern, mock.module);
  });

  mockery.enable({
    useCleanCache: true,
    warnOnUnregistered: false
  });
}

function mockModuleEnd (mocks) {
  mockery.disable();

  mocks.forEach(function (mock) {
    mockery.deregisterMock(mock.pattern);
  });
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

function mockSubsBegin () {
  mockModuleBegin([{
    pattern: '../data',
    module: serviceData
  }]);
}

function mockSubsEnd () {
  mockModuleEnd([{
    pattern: '../data'
  }]);
}

function mockServiceMailBegin () {
  mockModuleBegin([{
    pattern: './mail',
    module: serviceMail
  }]);
}

function mockServiceMailEnd () {
  mockModuleEnd([{
    pattern: './mail'
  }]);
}

function mockServiceSubscriptionBegin () {
  mockModuleBegin([{
    pattern: './subs',
    module: serviceSubscription
  }]);
}

function mockServiceSubscriptionEnd () {
  mockModuleEnd([{
    pattern: './subs'
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

function mockMailBegin () {
  mockModuleBegin([{
    pattern: './queue',
    module: queue
  }]);
}

function mockMailEnd () {
  mockModuleEnd([{
    pattern: './queue'
  }]);
}

function mockQueueBegin () {
  mockModuleBegin([{
    pattern: 'amqplib',
    module: amqplib
  }, {
    pattern: './mailer',
    module: mailer
  }]);
}

function mockQueueEnd () {
  mockModuleEnd([{
    pattern: 'amqplib'
  }, {
    pattern: './mailer'
  }]);
}

function mockInterfaceBegin () {
  mockModuleBegin([{
    pattern: './interface',
    module: actionInterface
  }]);
}

function mockInterfaceEnd () {
  mockModuleEnd([{
    pattern: './interface'
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
  },
  serviceMail: {
    begin: mockServiceMailBegin,
    end: mockServiceMailEnd
  },
  mail: {
    begin: mockMailBegin,
    end: mockMailEnd
  },
  queue: {
    begin: mockQueueBegin,
    end: mockQueueEnd
  },
  interface: {
    begin: mockInterfaceBegin,
    end: mockInterfaceEnd
  },
  serviceSubscription: {
    begin: mockServiceSubscriptionBegin,
    end: mockServiceSubscriptionEnd
  },
  subs: {
    begin: mockSubsBegin,
    end: mockSubsEnd
  }
};
