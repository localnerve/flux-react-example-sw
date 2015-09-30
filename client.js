/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * The client-side entry point.
 */
/* global document, window, DEBUG */
'use strict';

var debugLib = require('debug');
var debug = debugLib('Example:Client');
var React = require('react');
var createElementWithContext = require('fluxible-addons-react').createElementWithContext;

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

  if (DEBUG) {
    window.context = context;
  }

  debug('rendering app');
  React.render(
    createElementWithContext(context, {
      analytics: dehydratedState.analytics
    }),
    document.getElementById('application')
  );
});
