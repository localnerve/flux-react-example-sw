/**
 * Copyright 2015, Alex Grant, LocalNerve, LLC.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

module.exports = {
  sendMail: function (input, callback) {
    if (input.emulateError) {
      return callback(new Error('mock'));
    }
    callback();
  },

  contactWorker: function () {
  }
};
