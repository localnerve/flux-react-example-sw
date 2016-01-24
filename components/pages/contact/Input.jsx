/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');

var ContactInput = React.createClass({
  propTypes: {
    fieldValue: React.PropTypes.string,
    setInputReference: React.PropTypes.func.isRequired,
    label: React.PropTypes.object.isRequired,
    inputElement: React.PropTypes.string.isRequired,
    inputType: React.PropTypes.string,
    inputId: React.PropTypes.string.isRequired,
    focus: React.PropTypes.bool.isRequired
  },

  render: function () {
    var inputElement = React.createElement(this.props.inputElement, {
      type: this.props.inputType,
      id: this.props.inputId,
      name: this.props.inputId,
      key: this.props.inputId,
      title: this.props.label.help,
      placeholder: this.props.label.help,
      ref: this.props.setInputReference,
      className: 'form-value-element',
      autoFocus: this.props.focus,
      required: true,
      'aria-required': true,
      defaultValue: this.props.fieldValue
    });
    return (
      <div>
        <label htmlFor={this.props.inputId} key={this.props.inputId + '-label'}>
          {this.props.label.text}
        </label>
        {inputElement}
      </div>
    );
  }
});

module.exports = ContactInput;
