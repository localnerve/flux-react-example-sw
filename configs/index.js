/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * The server-side main config loader.
 * 
 */
'use strict';

var fs = require('fs');
var path = require('path');
var nconf = require('nconf');

var localEnv = 'local.env.json';

var exclude = [ 'index.js', localEnv ];

/**
 * Loads modules in this directory.
 * Return an object keyed by name.
 */
function configs (nconf) {
  var result = {};
  fs.readdirSync(__dirname).forEach(function (item) {
    var name = path.basename(item);
    if (exclude.indexOf(name) === -1) {
      result[name] = require('./' + name)(nconf);
    }
  });
  return result;
}

// Create a new configuration with overrides
function create (overrides) {
  nconf
    .overrides(overrides || {})
    .env()
    .file({ file: path.join(__dirname, localEnv) })
    .defaults(configs(nconf));

  var config = nconf.get();

  // Remove all the items that pass the filter
  Object.keys(config).filter(function (key) {
    return /^(?:npm)?_/.test(key);
  }).forEach(function (key) {
    delete config[key];
  });

  return config;
}

module.exports = {
  create: create
};