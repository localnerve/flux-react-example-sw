/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Example:Data:Cache');
var markdown = require('./markdown');

// FIXME:
// Cache storage should not be in this process
// in a real application (issue #9)
var cache = {};

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

var formatToCache = {
  markup: function (params, data) {
    writeToCache(params, data);
  },
  markdown: function (params, data) {
    writeToCache(params, markdown(data));
  },
  json: function (params, data) {
    var obj = JSON.parse(data);
    Object.keys(obj).forEach(function(key) {
      writeToCache({
        resource: key
      }, obj[key]);
    });
  }
};

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
  get: function (resource) {
    var result;
    var cached = cache[resource];

    if (cached) {
      result = readFromCache(cached);
    }

    return result;
  },

  put: function (params, data) {
    debug(
      'putting data into cache',
      'resource: '+params.resource,
      'format: '+params.format,
      'data: '+data
    );

    if (!params || !params.resource || !data) {
      throw new Error('Invalid arguments to cache put');
    }

    formatToCache[params.format || 'json'](params, data);
  }
};
