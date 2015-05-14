/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');

var ContactMessage = React.createClass({
  propTypes: {
    fieldValue: React.PropTypes.string,
    setInputReference: React.PropTypes.func.isRequired
  },
  getDefaultProps: function () {
    return {
      fieldValue: null,
      setInputReference: function () {}
    };
  },
  render: function () {
    return (
      <div>
        <label htmlFor="message-input" key="message-label">
          What is your message?
        </label>
        <textarea type="text"
          title="Enter your message" placeholder="Enter your message"
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
