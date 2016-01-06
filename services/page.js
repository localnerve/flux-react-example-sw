/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * A Yahoo fetchr service definition for a page request
 */
'use strict';

var data = require('./data');
var error = require('./error');

module.exports = {
  name: 'page',

  /**
   * The read CRUD method definition.
   * Just directs work. Params are per Yahoo fetchr.
   *
   * @param {Object} req - Not used.
   * @param {String} resource - Not used.
   * @param {Object} params - The data fetch parameters.
   * @param {Object} config - Not used.
   * @param {Function} callback - The callback to execute on completion.
   */
  read: function (req, resource, params, config, callback) {
    return data.fetch(params, function (err, data) {
      callback(error(err), data);
    });
  }

  // create: function(req, resource, params, body, config, callback) {},
  // update: function(resource, params, body, config, callback) {},
  // delete: function(resource, params, config, callback) {}
};
