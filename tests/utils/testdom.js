/**
 * Copyright 2015, Alex Grant, LocalNerve, LLC.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Shim document, window with jsdom if not defined.
 * Add globals if needed.
 */
/* global global, document */
'use strict';

module.exports = function(markup, addGlobals) {
  if (typeof document !== 'undefined') {
    return;
  }

  var jsdom = require('jsdom').jsdom;
  global.document = jsdom(markup || '<!doctype html><html><body></body></html>');
  global.window = document.defaultView;
  global.navigator = global.window.navigator;
    
  if (addGlobals) {    
    Object.keys(addGlobals).forEach(function(key) {
      global.window[key] = addGlobals[key];
    });
  }
};