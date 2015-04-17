/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Example:Mail');
var mailer = require('./mailer');

function send (input, callback) {
  debug('sending mail', input);

  mailer.queueMail(input, callback);
}

module.exports = {
  send: send
};