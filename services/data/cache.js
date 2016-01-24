/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Example:Data:Cache');
var markdown = require('./markdown');

// FIXME:
// Cache storage should not be in this process
// in a real application (issue #9)
var cache = {};

/**
 * Write a data entity to the cache.
 *
 * @param {Object} params - data entity parameters.
 * @param {String} params.resource - The key for the data entity: Its resource name.
 * @param {Object} params.models - The models associated with the data for the current key.
 * @param {Object|String} data - The html or json data for the resource.
 */
function writeToCache (params, data) {
  var obj = {
    models: params.models,
    content: data
  };

  cache[params.resource] = obj;

  debug(
    'wrote cache[' + params.resource + ']',
    require('util').inspect(obj, { depth: null })
  );
}

/***
 * Format the data by its type and write it to the cache.
 */
var formatToCache = {
  /**
   * Markup is a pass-thru format. Write directly to cache.
   */
  markup: function (params, data) {
    writeToCache(params, data);
  },
  /**
   * Format Mardown to markup then write to cache.
   */
  markdown: function (params, data) {
    writeToCache(params, markdown(data));
  },
  /**
   * For Json data, write each top-level key as a separate resource to the cache.
   * Data formatted as parsed javascript.
   */
  json: function (params, data) {
    var obj = JSON.parse(data);
    Object.keys(obj).forEach(function(key) {
      writeToCache({
        resource: key,
        models: params.models
      }, obj[key]);
    });
  }
};

/**
 * Mediate models as appropriate after resource was read from cache.
 *
 * @param {Object} cached - The object as read from cache.
 * @returns {Object} Cached object with its models expanded into objects.
 */
function readFromCache (cached) {
  var result = {
    models: cached.models,
    content: cached.content
  };

  if (cached.models) {
    // Expand a resource's model references to the model data
    result.models = cached.models.reduce(function(prev, curr) {
      prev[curr] = cache.models.content[curr];
      return prev;
    }, {});
  }

  debug(
    'read from cache',
    require('util').inspect(result, { depth: null })
  );

  return result;
}

module.exports = {
  /**
   * Read from cache.
   *
   * @param {String} resource - The resource name to lookup.
   * @returns {Object} The mediated cached object, or undefined if not found.
   */
  get: function (resource) {
    var result;
    var cached = cache[resource];

    if (cached) {
      result = readFromCache(cached);
    }

    return result;
  },

  /**
   * Write to cache.
   *
   * @param {Object} params - The data accompanying the main payload.
   * @param {String} params.resource - The key: The resource name.
   * @param {String} params.format - The format of the main payload.
   * @param {Object} params.models - Models associated with the main payload.
   * @param {Object|String} data - The main payload. The content.
   */
  put: function (params, data) {
    debug(
      'putting data into cache',
      'resource: '+params.resource,
      'format: '+params.format,
      'models: '+params.models,
      'data: '+data
    );

    if (!params || !params.resource || !data) {
      throw new Error('Invalid arguments to cache put');
    }

    formatToCache[params.format || 'json'](params, data);
  }
};
