/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var Input = require('./Input.jsx');
var Result = require('./Result.jsx');
var merge = require('lodash/object/merge');

var classes = {
  name: Input,
  email: Input,
  message: Input,
  result: Result
};

var inputProps = {
  name: {
    inputElement: 'input',
    inputType: 'text',
    inputId: 'name-input'
  },
  email: {
    inputElement: 'input',
    inputType: 'email',
    inputId: 'email-input'
  },
  message: {
    inputElement: 'textarea',
    inputId: 'message-input'
  },
  result: {}
};

module.exports = {
  createElement: function (component, props) {
    return React.createElement(
      classes[component],
      merge(props, inputProps[component])
    );
  }
};
