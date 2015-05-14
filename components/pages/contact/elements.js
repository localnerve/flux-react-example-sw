/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var Name = require('./Name.jsx');
var Email = require('./Email.jsx');
var Message = require('./Message.jsx');
var Result = require('./Result.jsx');

var classes = {
  name: Name,
  email: Email,
  message: Message,
  result: Result
};

function getClass (component) {
  return classes[component];
}

module.exports = {
  createElement: function (component, props) {
    return React.createElement(getClass(component), props);
  }
};
