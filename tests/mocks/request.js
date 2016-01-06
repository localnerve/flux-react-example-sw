/**
 * Copyright 2015, Alex Grant, LocalNerve, LLC.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global Promise */
'use strict';

function Request (url, options) {
  this.url = url;
  this.method = options.method;
  this.body = options.body;
  this.credentials = options.credentials;
}

Request.prototype.json = function () {
  return Promise.resolve(this.body);
};

module.exports = Request;
