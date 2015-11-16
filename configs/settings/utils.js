/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var path = require('path');

/**
 * Prepends a path to object values.
 * Returns a new object result.
 * If a property value is not a String, it is passed along by reference unaffected.
 *
 * @param {Object} fromObj - The object whose String properties are to have paths prepended to them.
 * @param {String} prePath - The path to prepend.
 * @returns {Object} A fromObject copy with the given path prepended to the String values.
 */
function prependPathToObject (fromObj, prePath) {
  return Object.keys(fromObj).reduce(function (obj, key) {
    var fromValue = fromObj[key];
    if (typeof fromValue === 'string') {
      obj[key] = path.join(prePath, fromValue);
    } else if (Object.prototype.toString.call(fromValue) === '[object Array]') {
      obj[key] = fromValue.map(function (val) {
        return path.join(prePath, val);
      });
    } else if (typeof fromValue === 'object') {
      obj[key] = prependPathToObject(fromValue, prePath);
    } else {
      obj[key] = fromValue;
    }
    return obj;
  }, {});
}

module.exports = {
  prependPathToObject: prependPathToObject
};
