/**
 * Copyright 2015, Alex Grant, LocalNerve, LLC.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var routesResponse = require('../fixtures/routes-response');
var config = require('../../configs').create().data;

// setup some canned responses
var defaultResponse = 'aGVsbG8gd29ybGQK'; // base64 encoded 'hello world'
var responses = {};
// base64 encode routes-response fixture as response for FRED.url
responses[config.FRED.url()] =
  new Buffer(JSON.stringify(routesResponse)).toString(config.FRED.contentEncoding());

function SuperAgent () {
}

SuperAgent.prototype = {
  get: function (url) {
    this.url = url;
    return this;
  },
  set: function () {
    return this;
  },
  end: function (cb) {
    var response = responses[this.url] || defaultResponse;

    var body = {
      content: response
    };

    cb(null, { body: body });
  }
};

module.exports = new SuperAgent();
