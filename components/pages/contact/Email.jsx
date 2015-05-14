/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');

var ContactEmail = React.createClass({
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
        <label htmlFor="email-input" key="email-label">
          What is your email address?
        </label>
        <input type="text"
          title="Enter your email address" placeholder="Enter your email address"
          id="email-input" name="email-input" key="email-input"
          ref={this.props.setInputReference}
          className="form-value-element"
          autoFocus="true" required="true" aria-required="true"
          defaultValue={this.props.fieldValue}
        />
      </div>
    );
  }
});

module.exports = ContactEmail;
