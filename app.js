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
var routesUtil = require('./utils/routes');

debug('Creating FluxibleApp');
var app = new FluxibleApp({
  appComponent: React.createFactory(require('./components/Application.jsx'))
});

// Adding on to fluxible to support dynamic routes
app.updateRoutes = function updateRoutes(state, done) {
  debug('Updating Routes');

  var routerIndex;
  for (var i = 0; i < app._plugins.length; i++) {
    if (app._plugins[i].name === 'RoutrPlugin') {
      routerIndex = i;
      break;
    }
  }
  if (routerIndex) {
    app._plugins.splice(routerIndex, 1);
  }

  routesUtil(state, function(err, routes) {
    if (!err) {
      debug('Adding Routr Plugin');    
      app.plug(routrPlugin({ routes: routes }));
    }
    done && done(err, routes);
  });
};

debug('Adding Fetchr Plugin');
app.plug(fetchrPlugin({ xhrPath: '/_api' }));

debug('Registering Stores');
app.registerStore(require('./stores/ApplicationStore'));

module.exports = app;