/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * A Yahoo fetchr service definition for push notification subscriptions.
 */
'use strict';

var subs = require('./subs');

module.exports = {
  name: 'subscription',

  /**
   * Create a subscription.
   *
   * @param {Object} req - Not used.
   * @param {String} resource - Not used.
   * @param {Object} params - subscriptionId and endpoint.
   * @param {Object} body - Not used.
   * @param {Object} config - Not used.
   * @param {Function} callback - The callback to execute on completion.
   */
  create: function (req, resource, params, body, config, callback) {
    return subs.create(params.subscriptionId, params.endpoint, callback);
  },

  /**
   * Read a subscription.
   *
   * @param {Object} req - Not used.
   * @param {String} resource - Not used.
   * @param {Object} params - subscriptionId.
   * @param {Object} config - Not used.
   * @param {Function} callback - The callback to execute on completion.
   */
  read: function (req, resource, params, config, callback) {
    return subs.read(params.subscriptionId, callback);
  },

  /**
   * Update a subscription.
   *
   * @param {Object} req - Not used.
   * @param {String} resource - Not used.
   * @param {Object} params - subscriptionId, endpoint.
   * @param {Object} body - topics.
   * @param {Object} config - Not used.
   * @param {Function} callback - The callback to execute on completion.
   */
  update: function(req, resource, params, body, config, callback) {
    return subs.update(params.subscriptionId, body.topics, params.endpoint, callback);
  },

  /**
   * Delete a subscription.
   *
   * @param {Object} req - Not used.
   * @param {String} resource - Not used.
   * @param {Object} params - subscriptionId.
   * @param {Object} config - Not used.
   * @param {Function} callback - The callback to execute on completion.
   */
  delete: function(req, resource, params, config, callback) {
    return subs.delete(params.subscriptionId, callback);
  }
};
