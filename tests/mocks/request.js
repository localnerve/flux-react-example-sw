/**
 * Copyright 2015, Alex Grant, LocalNerve, LLC.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

function Request (url, options) {
  this.url = url;
  this.method = options.method;
  this.body = options.body;
  this.credentials = options.credentials;
}

module.exports = Request;
