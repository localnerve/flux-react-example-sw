/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Assemble the Fluxible app.
 */
'use strict';

var debug = require('debug')('Example:App');
var FluxibleApp = require('fluxible');
var fetchrPlugin = require('fluxible-plugin-fetchr');
var ApplicationStore = require('./stores/ApplicationStore');
var ContentStore = require('./stores/ContentStore');
var ContactStore = require('./stores/ContactStore');
var BackgroundStore = require('./stores/BackgroundStore');
var RouteStore = require('./stores/RouteStore');
var ModalStore = require('./stores/ModalStore');

debug('Creating FluxibleApp');
var app = new FluxibleApp({
  component: require('./components/Application.jsx')
});

debug('Adding Plugins');
app.plug(fetchrPlugin({ xhrPath: '/_api' }));

debug('Registering Stores');
app.registerStore(ApplicationStore);
app.registerStore(ContentStore);
app.registerStore(ContactStore);
app.registerStore(BackgroundStore);
app.registerStore(RouteStore);
app.registerStore(ModalStore);

module.exports = app;
