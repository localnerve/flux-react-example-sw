/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * The server-side main config loader.
 * 
 */
'use strict';

var nconf = require('nconf');
var fs = require('fs');
var path = require('path');

var exclude = [ 'index' ];

// Loads modules in this directory.
// Return an object keyed by name.
function configs () {
  var result = {};
  fs.readdirSync(__dirname).forEach(function(item) {
    var name = path.basename(item);
    if (exclude.indexOf(name) === -1) {
      result[name] = require('./' + name);
    }
  });
  return result;
}

// Create a configuration with overrides
function create(overrides) {
  nconf.overrides(overrides || {});
  nconf.env();
  nconf.defaults(configs());
  return nconf;
}

module.exports = {
  create: create
};