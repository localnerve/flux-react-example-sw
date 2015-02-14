/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global document, window, DEBUG */
'use strict';

var debugLib = require('debug');
var debug = debugLib('Example:Client');
var React = require('react');
var app = require('./app');
var routesAction = require('./actions/routes');

if (DEBUG) {
  window.React = React; // for chrome dev tool support
  debugLib.enable('*'); // show debug trail
}

var dehydratedState = window.App; // sent from the server

app.updateRoutes(dehydratedState, function(err, routes) {
  if (err) {
    throw err;
  }

  debug('rehydrating app');
  app.rehydrate(dehydratedState, function (err, context) {
    if (err) {
      throw err;
    }

    window.context = context;

    // MUST add callback and render in callback
    context.executeAction(routesAction, { routes: routes });

    debug('rendering app');
    React.withContext(context.getComponentContext(), function () {
      React.render(
        app.getAppComponent()(),
        document.getElementById('docsapp')
      );
    });
  });
});