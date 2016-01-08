/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Classification scheme for the future servicing of failed POST requests.
 *
 * Utilities for setting/accessing a 'fallback' property used for offline
 * network synchronization.
 * The fallback data is passed to the service worker via the POST body.
 *
 *  @see assets/scripts/sw/sync
 *  @see assets/scripts/sw/init/apiRequests.js
 */
'use strict';

var propertyName = '_fallback';

var OPERATIONS = {
  subscribe: 'subscribe',
  unsubscribe: 'unsubscribe',
  updateTopics: 'updateTopics',
  contact: 'submit',
  demo: 'demo'
};

var TYPES = {
  push: 'push',
  contact: 'contact'
};

/**
 * Create fallback object in input.
 *
 * @private
 *
 * @param {Object} input - An input object to update.
 * @param {String} type - A type identifier.
 * @param {String} key - A key identifier.
 * @param {String} operation An operation identifier.
 * @param {Boolean} replayable - A boolean indicating if an operation is
 * user replayable, meaning the UI gives the user retry/failure options.
 * @returns {Object} The input object, with the added object if input not falsy.
 */
function setProperty (input, type, key, operation, replayable) {
  if (input) {
    input[propertyName] = {
      type: type,
      key: key,
      operation: operation,
      userReplayable: replayable
    };
  }

  return input;
}

/**
 * Set fallback property for push parameters.
 *
 * @param {Object} input - The object to set the property on.
 * @param {String} key - A unique key.
 * @param {String} operation - An operation identifier.
 * @returns {Object} the input with the fallback property added.
 */
function push (input, key, operation) {
  return setProperty(input, TYPES.push, key, operation, false);
}

/**
 * Set fallback property for contact parameters.
 *
 * @param {Object} input - The object to set the property on.
 * @param {String} key - A unique key.
 * @returns {Object} the input with the fallback property added.
 */
function contact (input, key) {
  return setProperty(input, TYPES.contact, key, OPERATIONS.contact, true);
}

module.exports = {
  push: push,
  contact: contact,
  propertyName: propertyName,
  ops: OPERATIONS,
  types: TYPES
};
