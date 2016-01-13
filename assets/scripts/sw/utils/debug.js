/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global console */
'use strict';

var toolbox = require('sw-toolbox');
var slice = Array.prototype.slice;
var toString = Object.prototype.toString;

/**
 * A console logger that passes args to console.log
 */
function debug (moduleName, options) {
  var flag, args;

  if (toString.call(options) === '[object Object]') {
    flag = options.debug;
    args = slice.call(arguments, 2);
  } else {
    args = slice.call(arguments, 1);
  }

  if (flag || toolbox.options.debug) {
    console.log.apply(console, ['[sw ' + moduleName + ']'].concat(args));
  }
}

module.exports = function (moduleName) {
  return debug.bind(this, moduleName);
};
