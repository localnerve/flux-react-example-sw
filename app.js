/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Example:App');
var React = require('react');
var FluxibleApp = require('fluxible');
var fetchrPlugin = require('fluxible-plugin-fetchr');
var routrPlugin = require('fluxible-plugin-routr');
var ApplicationStore = require('./stores/ApplicationStore');
var tranformers = require('./utils/transformers');

debug('Creating FluxibleApp');
var app = new FluxibleApp({
  appComponent: React.createFactory(require('./components/Application.jsx'))
});

debug('Adding Plugins');
app.plug(fetchrPlugin({ xhrPath: '/_api' }));
app.plug(routrPlugin({
  dehydrateRoutes: tranformers.fluxibleToJson,
  rehydrateRoutes: tranformers.jsonToFluxible,
  storeName: ApplicationStore.storeName,
  storeEvent: ApplicationStore.routesEvent
}));

debug('Registering Stores');
app.registerStore(ApplicationStore);

module.exports = app;