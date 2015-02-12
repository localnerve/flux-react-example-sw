/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global document, window, DEBUG */
'use strict';

var React = require('react');
var app = require('./app');

var dehydratedState = window.App; // sent from the server

var debug;
if (DEBUG) {
  // for chrome dev tool support
  window.React = React;
  var debugLib = require('debug');
  
  debug = debugLib('Client');
  debugLib.enable('*');
  debug('rehydrating app');
}

app.rehydrate(dehydratedState, function (err, context) {
  if (err) {
    throw err;
  }

  window.context = context;

  if (DEBUG) {
    debug('rendering app');
  }
  React.withContext(context.getComponentContext(), function () {
    React.render(
      app.getAppComponent()(),
      document.getElementById('docsapp')
    );
  });
});