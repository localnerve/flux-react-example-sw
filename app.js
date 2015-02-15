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
var extend = require('./utils/fluxible-extension');

debug('Creating FluxibleApp');
var app = new FluxibleApp({
  appComponent: React.createFactory(require('./components/Application.jsx'))
});
extend(app, routrPlugin);

debug('Adding Fetchr Plugin');
app.plug(fetchrPlugin({ xhrPath: '/_api' }));

debug('Registering Stores');
app.registerStore(require('./stores/ApplicationStore'));

module.exports = app;