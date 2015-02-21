/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global document, window, DEBUG */
'use strict';

var debugLib = require('debug');
var debug = debugLib('Example:Client');
var React = require('react');

if (DEBUG) {
  window.React = React; // for chrome dev tool support
  debugLib.enable('*'); // show debug trail
}

var app = require('./app');
var dehydratedState = window.App; // sent from the server


debug('rehydrating app');
app.rehydrate(dehydratedState, function (err, context) {
  if (err) {
    throw err;
  }

  window.context = context;

  debug('rendering app');
  React.withContext(context.getComponentContext(), function () {
    React.render(
      app.getAppComponent()({
        analytics: dehydratedState.analytics
      }),
      document.getElementById('application')
    );
  });
});