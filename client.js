/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global document, window */
'use strict';

var React = require('react');
var debug = require('debug');
var app = require('./app');
var bootstrapDebug = debug('Example');
var dehydratedState = window.App; // sent from the server

// for chrome dev tool support
window.React = React;
debug.enable('*');

bootstrapDebug('rehydrating app');
app.rehydrate(dehydratedState, function (err, context) {
  if (err) {
    throw err;
  }

  window.context = context;

  React.withContext(context.getComponentContext(), function () {
    React.render(
      app.getAppComponent()(),
      document.getElementById('docsapp')
    );
  });
});
