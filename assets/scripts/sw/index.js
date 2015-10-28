/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Entry point for the service worker.
 *
 * The 'precache' and 'data' modules are generated by the build.
 * @see grunt/tasks/service-worker.js
 */
'use strict';

var toolbox = require('sw-toolbox');
var data = require('./data');

toolbox.options.debug = data.debug;

// Construct cache name and save scope.
// Relies on sw-toolbox default name format for scope.
// CacheId must always start name.
var m = toolbox.options.cache.name.match(/([^\$]+)\${3}$/);
toolbox.options.scope = m && m[1];
toolbox.options.cache.name = data.cacheId + '-' + toolbox.options.cache.name;

var debug = require('./utils/debug')('index');
var init = require('./init');
var apis = require('./apis');
var assets = require('./assets');

// Setup our activate handling
require('./activate');

// Setup non-project static asset precaching (cdn requests)
assets.setupAssetRequests();

// Setup api requests
apis.setupApiRequests();

// Setup message handling
require('./messages');

// Setup the sw-precache managed cache
require('./precache');

// If all init.data exists (and service-worker is starting), run the init command.
// The init message may never come if service-worker was restarted by the system.
init.data()
.then(function (payload) {
  payload.startup = true;
  init.command(payload, function (res) {
    if (res.error) {
      console.error('startup init command failed', res.error);
    }
  });
}).catch(function (error) {
  debug(toolbox.options, 'startup not running init command');
});
