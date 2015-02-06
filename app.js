/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var React = require('react');
var FluxibleApp = require('fluxible');
var fetchrPlugin = require('fluxible-plugin-fetchr');
var routrPlugin = require('fluxible-plugin-routr');
var routes = require('./config/routes');

var app = new FluxibleApp({
    appComponent: React.createFactory(require('./components/Application.jsx'))
});

app.plug(fetchrPlugin({ xhrPath: '/_api' }));
app.plug(routrPlugin({ routes: routes }));

// app.registerStore(require('./stores/DocStore'));
app.registerStore(require('./stores/ApplicationStore'));

module.exports = app;
