/**
 * Copyright 2015, Alex Grant, LocalNerve, LLC.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

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
    var body = {
      // base64 encoded 'hello world'
      content: 'aGVsbG8gd29ybGQK'
    };

    cb(null, { body: body });
  }
};

module.exports = new SuperAgent();
