/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global console */
'use strict';

var toolbox = require('sw-toolbox');
var slice = Array.prototype.slice;

/**
 * A console logger that passes args to console.log
 */
function debug (moduleName, options) {
  options = options || {};
  var flag = options.debug || toolbox.options.debug;
  if (flag) {
    console.log.apply(console, ['[sw ' + moduleName + ']'].concat(
      slice.call(arguments, 2))
    );
  }
}

module.exports = function (moduleName) {
  return debug.bind(this, moduleName);
};
