/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Entry point for the service worker.
 * The precache and data modules are generated by the build.
 */
/* global Request */
'use strict';

// For now, this only works in dev builds, sw-toolbox issue #31
var toolbox = require('sw-toolbox');
var data = require('./data');

toolbox.options.cacheName = data.cacheId + '-' + toolbox.options.cacheName;
toolbox.options.debug = data.debug;

// Setup non-project static asset precaching (cdn requests)
toolbox.precache(data.assets.map(function (asset) {
  return new Request(asset, {
    mode: 'no-cors'
  });
}));

// Setup message handling
require('./messages');

// Setup the in-project static asset precaching
require('./precache');

// Handle the api gets
data.api_gets.forEach(function (path) {
  toolbox.router.get(path+'*', toolbox.networkFirst, { debug: data.debug });
});

// TODO:
// Remove this, prefetch and cache in init_stores
toolbox.router.get('/(.*)', toolbox.networkFirst, { debug: data.debug });

// TODO:
// Remove this, setup in init_stores, setup prefetching
// add new command for background size update
toolbox.router.get('*', toolbox.networkFirst, {
  debug: data.debug,
  origin: 'lorempixel.com'
});

// TODO:
// Handle the post request?
// Use background sync to handle when available.
