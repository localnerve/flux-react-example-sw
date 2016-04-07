/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

/**
 * Find the first [object Object] with key that matches value.
 *
 * @param {String} key - The property name.
 * @param {String} value - The property value.
 * @param {Object} obj - The object to search.
 * @returns {Object} the object that contains key===value. Otherwise undefined.
 */
function objContains (key, value, obj) {
  if (obj[key] === value) {
    return obj;
  }

  var found;

  Object.keys(obj).some(function (k) {
    if (Object.prototype.toString.call(obj[k]) === '[object Object]') {
      found = objContains(key, value, obj[k]);
      return !!found;
    }
  });

  return found;
}

module.exports = {
  objContains: objContains
};
