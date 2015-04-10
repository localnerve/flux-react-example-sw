/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var markdown = require('./markdown');

// TODO: Change to Redis to support multiple processes
var cache = {};

function writeToCache (params, data) {
  var obj = {
    models: params.models,
    data: data    
  };
  cache[params.resource] = obj;
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

module.exports = {
  get: function (resource) {
    var result;
    var obj = cache[resource];

    if (obj) {
      if (obj.models) {
        obj.models = obj.models.reduce(function(prev, curr) {
          prev[curr] = cache.models[curr];
        }, {});
      }
      // TODO: support returning both models and data
      result = obj.data;
    }

    return result;
  },
  put: function (params, data) {
    formatToCache[params.format || 'json'](params, data);
  }
};