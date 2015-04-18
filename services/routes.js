/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var data = require('./data');

module.exports = {
  name: 'routes',

  // at least one of the CRUD methods is required
  read: function(req, resource, params, config, callback) {
    return data.fetch(params, callback);
  }
  
  // create: function(req, resource, params, body, config, callback) {},
  // update: function(resource, params, body, config, callback) {},
  // delete: function(resource, params, config, callback) {}
};