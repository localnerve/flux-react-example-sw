/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Module to contain indexedDB interactions
 */
/* global Promise */
'use strict';

var treo = require('treo');

var IDB_VERSION = 1;
var IDB_NAME = 'service-worker';

/**
 * Return database and store references.
 */
function _dbAndStore (storeName) {
  var schema = treo.schema()
    .version(IDB_VERSION)
    .addStore(storeName);
  var db = treo(IDB_NAME, schema);

  return {
    /**
     * wrap db close
     */
    close: function () {
      db.close(function () {
      });
    },
    store: db.store(storeName)
  };
}

/**
 * Put a collection of key, value pairs in an indexedDB store.
 *
 * @param {String} storeName - The store name.
 * @param {Array} kvCollection - An array of keys and values.
 * @return {Object} A promise.
 */
function batch (storeName, kvCollection) {
  return new Promise(function (resolve, reject) {
    var o = _dbAndStore(storeName);

    o.store.batch(kvCollection, function (err, res) {
      if (err) {
        return reject(err);
      }
      resolve(res);
      o.close();
    });
  });
}

/**
 * Remove a key, value pair from the store
 */
function del (storeName, key) {
  return new Promise(function (resolve, reject) {
    var o = _dbAndStore(storeName);

    o.store.del(key, function (err, res) {
      if (err) {
        return reject(err);
      }
      resolve(res);
      o.close();
    });
  });
}

/**
 * Get a value from an indexedDB store.
 *
 * @param {String} storeName - The store name.
 * @param {String} key - The key to retrieve the value with.
 */
function get (storeName, key) {
  return new Promise(function (resolve, reject) {
    var o = _dbAndStore(storeName);

    o.store.get(key, function (err, res) {
      if (err) {
        return reject(err);
      }
      resolve(res);
      o.close();
    });
  });
}

/**
 * Put a key, value pair in an indexedDB store.
 *
 * @param {String} storeName - The name of the store.
 * @param {String} key - The name of the key.
 * @param {Object} value - The value to store.
 * @return {Object} A promise.
 */
function put (storeName, key, value) {
  return new Promise(function (resolve, reject) {
    var o = _dbAndStore(storeName);

    o.store.put(key, value, function (err, res) {
      if (err) {
        return reject(err);
      }
      resolve(res);
      o.close();
    });
  });
}

module.exports = {
  batch: batch,
  del: del,
  get: get,
  put: put
};
