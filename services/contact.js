/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var mail = require('./mail');

module.exports = {
  name: 'contact',
  // at least one of the CRUD methods is required
  create: function(req, resource, params, body, config, callback) {

    return mail.send(params, callback);
  }
  
  // read: function(req, resource, params, config, callback) {},
  // update: function(resource, params, body, config, callback) {},
  // delete: function(resource, params, config, callback) {}  
};