/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Mockery and mock manager
 */
'use strict';

var mockery = require('mockery');
var debug = require('debug')('Test:Mocks');
var serviceData = require('./service-data');
var serviceMail = require('./service-mail');
var serviceSubscription = require('./service-subs');
var superAgent = require('./superagent');
var amqplib = require('./amqplib');
var cache = require('./cache');
var fetch = require('./fetch');
var queue = require('./queue');
var mailer = require('./mailer');
var remarkable = require('./remarkable');
var actionInterface = require('./actionInterface');
var swToolbox = require('./sw-toolbox');
var swUtilsDb = require('./sw-utils-db');
var swUtilsIdbTreo = require('./sw-utils-idb-treo');
var swData = require('./sw-data');

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

module.exports = {};

[{
  name: 'serviceData',
  mocks: [{
    pattern: './data',
    module: serviceData
  }]
},
{
  name: 'subs',
  mocks: [{
    pattern: '../data',
    module: serviceData
  }]
},
{
  name: 'serviceMail',
  mocks: [{
    pattern: './mail',
    module: serviceMail
  }]
},
{
  name: 'serviceSubscription',
  mocks: [{
    pattern: './subs',
    module: serviceSubscription
  }]
},
{
  name: 'superAgent',
  mocks: [{
    pattern: 'superagent',
    module: superAgent
  }, {
    pattern: './cache',
    module: cache
  }]
},
{
  name: 'fetch',
  mocks: [{
    pattern: './fetch',
    module: fetch
  }, {
    pattern: './cache',
    module: cache
  }]
},
{
  name: 'mail',
  mocks: [{
    pattern: './queue',
    module: queue
  }]
},
{
  name: 'queue',
  mocks: [{
    pattern: 'amqplib',
    module: amqplib
  }, {
    pattern: './mailer',
    module: mailer
  }]
},
{
  name: 'interface',
  mocks: [{
    pattern: './interface',
    module: actionInterface
  }]
},
{
  name: 'remarkable',
  mocks: [{
    pattern: 'remarkable',
    module: remarkable
  }]
},
{
  name: 'swToolbox',
  mocks: [{
    pattern: 'sw-toolbox',
    module: swToolbox
  }]
},
{
  name: 'swSyncIndex',
  mocks: [{
    pattern: 'sw-toolbox',
    module: swToolbox
  }, {
    pattern: 'treo',
    module: swUtilsIdbTreo
  }, {
    pattern: './idb',
    module: swUtilsDb
  }]
},
{
  name: 'swUtilsDb',
  mocks: [{
    pattern: './idb',
    module: swUtilsDb
  },{
    pattern: 'sw-toolbox',
    module: swToolbox
  }]
},
{
  name: 'swUtilsIdbTreo',
  mocks: [{
    pattern: 'treo',
    module: swUtilsIdbTreo
  }]
},
{
  name: 'swData',
  mocks: [{
    pattern: './data',
    module: swData
  }]
}].forEach(function (mockSpec) {
  module.exports[mockSpec.name] = {
    begin: function () {
      mockModuleBegin(mockSpec.mocks);
    },
    end: function () {
      mockModuleEnd(mockSpec.mocks);
    }
  };
});
