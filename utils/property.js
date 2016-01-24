/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Property helpers
 */
'use strict';

var toString = Object.prototype.toString;

/**
 * Detect object or array object class
 *
 * @param {Object} thing - something to test
 * @returns {Boolean} true if it is an Object or Array.
 */
function isObjectOrArray (thing) {
  return toString.call(thing) === '[object Object]' ||
         toString.call(thing) === '[object Array]';
}

/**
 * Recursively find a property on an Object object and return the value.
 * Follows objects and arrays on the search.
 * Finds and returns the value of the first matching property found by name.
 *
 * @param {String} propertyName - The property name to search for.
 * @param {Object|Array} input - The object to search.
 * @param {Boolean} [remove] - True to also remove the property if found.
 * @returns {Object} The value of the property found or undefined.
 */
function find (propertyName, input, remove) {
  var property;

  // bail if not something we search or invalid
  if (!isObjectOrArray(input) || !propertyName) {
    return property;
  }

  // found
  if (propertyName in input) {
    var result = input[propertyName];
    if (remove) {
      delete input[propertyName];
    }
    return result;
  }

  // setup to search objects and arrays
  var search = toString.call(input) === '[object Array]' ? {
    collection: input,
    /**
     * pass thru getter for array
     */
    get: function (i) {
      return i;
    }
  } : {
    collection: Object.keys(input),
    /**
     * key getter for Object
     */
    get: function (i) {
      return input[i];
    }
  };

  // find first
  search.collection.some(function (item) {
    var found;
    if (isObjectOrArray(search.get(item))) {
      found = find(propertyName, search.get(item), remove);
      if (!property) {
        property = found;
      }
    }
    return !!property;
  });

  return property;
}

module.exports = {
  find: find
};
