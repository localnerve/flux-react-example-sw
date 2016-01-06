/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * A Yahoo fetchr service definition for a routes request
 */
'use strict';

var data = require('./data');
var error = require('./error');

module.exports = {
  name: 'routes',

  /**
   * The read CRUD method definition.
   * Directs work and mediates the response. Params are per Yahoo fetchr.
   *
   * @param {Object} req - Not used.
   * @param {String} resource - Not used.
   * @param {Object} params - The data fetch parameters.
   * @param {Object} config - Not used.
   * @param {Function} callback - The callback to execute on completion.
   */
  read: function (req, resource, params, config, callback) {
    return data.fetch(params, function (err, res) {
      callback(error(err), res ? res.content : null);
    });
  }

  // create: function(req, resource, params, body, config, callback) {},
  // update: function(resource, params, body, config, callback) {},
  // delete: function(resource, params, config, callback) {}
};
