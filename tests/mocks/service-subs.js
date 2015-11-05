/**
 * Copyright 2015, Alex Grant, LocalNerve, LLC.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

module.exports = {
  create: function (subscriptionId, endpoint, callback) {
    callback();
  },
  read: function (subscriptionId, callback) {
    callback();
  },
  update: function (subscriptionId, topics, endpoint, callback) {
    callback();
  },
  delete: function (subscriptionId, callback) {
    callback();
  }
};
