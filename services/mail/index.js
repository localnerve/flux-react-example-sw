/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Example:Mail');

// TODO: implement

function send (input, callback) {
  debug('sending mail', input);

  callback(null, {    
    messages: []
  });
}

module.exports = {
  send: send
};