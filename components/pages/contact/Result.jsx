/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var cx = require('classnames');

var ContactResult = React.createClass({
  propTypes: {
    failure: React.PropTypes.bool.isRequired,
    message: React.PropTypes.string
  },
  getDefaultProps: function () {
    return {
      failure: false,
      message: ''
    };
  },
  render: function () {
    return (
      <div>
        <div className={cx({hide: this.props.failure})}>
          <h3>Thank you!</h3>
          <p>
            Your message has been received. I'll be in touch with you within 48 hours.
          </p>
        </div>
        <div className={cx({hide: !this.props.failure})}>
          <h3>Whoops!</h3>
          <p>
            Our contact service is temporarily unavailable. Please consider emailing your message to us directly.
          </p>
          <label htmlFor="orig-message-input" key="orig-message-label">
            For reference, this was your message
          </label>
          <textarea type="text"
            title="Your original message"
            id="orig-message-input" name="orig-message-input" key="orig-message-input"
            className="form-value-element"
            initialValue={this.props.fieldValue}>
          </textarea>
        </div>
      </div>
    );
  }
});

module.exports = ContactResult;
