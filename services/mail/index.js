/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var queue = require('./queue');

module.exports = {
  send: queue.sendMail,
  worker: queue.contactWorker
};
