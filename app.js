/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Example:App');
var FluxibleApp = require('fluxible');
var fetchrPlugin = require('fluxible-plugin-fetchr');
var routrPlugin = require('fluxible-plugin-dynamic-routr');
var ApplicationStore = require('./stores/ApplicationStore');
var ContentStore = require('./stores/ContentStore');
var ContactStore = require('./stores/ContactStore');
var tranformer = require('./utils').createFluxibleRouteTransformer({
  actions: require('./actions')
});

debug('Creating FluxibleApp');
var app = new FluxibleApp({
  component: require('./components/Application.jsx')
});

debug('Adding Plugins');
app.plug(fetchrPlugin({ xhrPath: '/_api' }));
app.plug(routrPlugin({
  dehydrateRoutes: tranformer.fluxibleToJson,
  rehydrateRoutes: tranformer.jsonToFluxible,
  storeName: ApplicationStore.storeName,
  storeEvent: ApplicationStore.routesEvent
}));

debug('Registering Stores');
app.registerStore(ApplicationStore);
app.registerStore(ContentStore);
app.registerStore(ContactStore);

module.exports = app;
