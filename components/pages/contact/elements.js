/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var Input = require('./Input.jsx');
var Result = require('./Result.jsx');
var merge = require('lodash/merge');

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
  /**
   * Create a Contact Element
   *
   * @param {String} component - The name of the component to create.
   * @param {Object} props - The props to create the component with.
   * @returns {Object} A React Element for the given contact component name and props.
   */
  createElement: function (component, props) {
    return React.createElement(
      classes[component],
      merge(props, inputProps[component])
    );
  }
};
