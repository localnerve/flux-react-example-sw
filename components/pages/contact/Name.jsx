/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');

var ContactName = React.createClass({
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
        <label htmlFor="name-input" key="name-label">
          What is your name?
        </label>
        <input type="text"
          title="Enter your name" placeholder="Enter your name"
          id="name-input" name="name-input" key="name-input"
          ref={this.props.setInputReference}
          className="form-value-element"
          autoFocus="true" required="true" aria-required="true"
          defaultValue={this.props.fieldValue}
        />
      </div>
    );
  }
});

module.exports = ContactName;
