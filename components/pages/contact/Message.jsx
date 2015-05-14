/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');

var ContactMessage = React.createClass({
  propTypes: {
    fieldValue: React.PropTypes.string,
    setInputReference: React.PropTypes.func.isRequired,
    label: React.PropTypes.object.isRequired
  },
  getDefaultProps: function () {
    return {
      fieldValue: null,
      setInputReference: function () {},
      label: {
        text: '',
        help: ''
      }
    };
  },
  render: function () {
    return (
      <div>
        <label htmlFor="message-input" key="message-label">
          {this.props.label.text}
        </label>
        <textarea type="text"
          title={this.props.label.help} placeholder={this.props.label.help}
          id="message-input" name="message-input" key="message-input"
          ref={this.props.setInputReference}
          className="form-value-element"
          autoFocus="true" required="true" aria-required="true"
          defaultValue={this.props.fieldValue}>
        </textarea>
      </div>
    );
  }
});

module.exports = ContactMessage;
