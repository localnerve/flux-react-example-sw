/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Example:Data');
var request = require('superagent');
var markdown = require('./markdown');

var cache = {};

// TODO: move to config and start a real integration strategy with branches
var branches = {
  development: 'master',
  production: 'master'
};

var formatToCache = {
  markup: function(resource, data) {
    cache[resource] = data;
  },
  markdown: function(resource, data) {
    cache[resource] = markdown(data);
  },
  json: function(resource, data) {
    var obj = JSON.parse(data);
    Object.keys(obj).forEach(function(key) {
      cache[key] = obj[key];
    });    
  }
};

function fetch(params, callback) {
  debug('fetching resource "'+params.resource+'"');

  if (cache[params.resource]) {
    return callback(null, cache[params.resource]);
  }

  // A bootstrap request has no url specified
  if (!params.url) {
    params.url = 'https://api.github.com/repos/localnerve/flux-react-example-data/contents/resources.json';
  }

  // Get the appropriate data for this instance
  params.url += '?ref=' + branches[process.env.NODE_ENV || 'development'];

  request.get(params.url).set('User-Agent', 'superagent')
  .end(function(err, res) {
    if (err) {
      debug('get failed: '+err);

      return callback(err);
    }

    var content = res.body && res.body.content;

    if (content) {
      debug ('successful content retrieved for', params.url);

      var raw = new Buffer(content, 'base64').toString();

      formatToCache[params.format || 'json'](params.resource, raw);

      callback(null, cache[params.resource]);
    } else {
      debug('Content not found for', params.url, res.body);
      
      callback(new Error('Content not found for '+params.url));
    }
  });
}

module.exports = {
  fetch: fetch
};