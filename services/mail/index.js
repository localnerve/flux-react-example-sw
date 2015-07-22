/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Example:Mail');
var queue = require('./queue');

function send (input, callback) {
  debug('sending mail', input);

  queue.sendMail(input, callback);
}

module.exports = {
  send: send,
  worker: queue.contactWorker
};
