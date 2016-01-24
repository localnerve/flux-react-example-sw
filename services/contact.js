/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * A Yahoo fetchr service definition for contact creation.
 */
'use strict';

var mail = require('./mail');
var error = require('./error');

module.exports = {
  name: 'contact',

  /**
   * The create CRUD method definition.
   * Just directs work. Params are per Yahoo fetchr.
   *
   * @param {Object} req - Not used.
   * @param {String} resource - Not used.
   * @param {Object} params - The collected contact fields to send.
   * @param {Object} body - Not used.
   * @param {Object} config - Not used.
   * @param {Function} callback - The callback to execute on completion.
   */
  create: function (req, resource, params, body, config, callback) {
    return mail.send(params, function (err, data) {
      callback(error(err), data);
    });
  }

  // read: function(req, resource, params, config, callback) {},
  // update: function(resource, params, body, config, callback) {},
  // delete: function(resource, params, config, callback) {}
};
