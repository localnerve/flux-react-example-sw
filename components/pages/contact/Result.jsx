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
    failedMessage: React.PropTypes.string.isRequired,
    label: React.PropTypes.object.isRequired,
    message: React.PropTypes.object.isRequired,
    business: React.PropTypes.object.isRequired
  },
  getDefaultProps: function () {
    return {
      failure: false,
      failedMessage: '',
      label: {
        failure: {
          text: ''
        },
        success: {
          text: ''
        }
      },
      message: {
        failure: {
          text: '',
          help: ''
        },
        success: {
          text: ''
        }
      },
      business: {
        email: '',
        telephone: '',
        alternateName: ''
      }
    };
  },
  render: function () {
    var resultLabel =
      this.props.label[this.props.failure ? 'failure' : 'success'].text;
    var resultMessage =
      this.props.message[this.props.failure ? 'failure' : 'success'].text;
    var uriMailTo = this.encodeURIMailTo();
    var uriTel = 'tel:+1-' + this.props.business.telephone;

    return (
      <div className="contact-result">
        <h3 className={cx({
          hide: this.props.failure
        })}>
          {resultLabel}
        </h3>
        <p>
          {resultMessage}
        </p>
        <p className="contact-result-contact">
          <a className="icon-envelop" href={uriMailTo}>
            <span>
              {this.props.business.email}
            </span>
          </a>
          <a className="icon-phone" href={uriTel}>
            <span>
              {this.props.business.telephone}
            </span>
          </a>
        </p>
        <div className={cx({
          hide: !this.props.failure,
          failure: this.props.failure
        })}>
          <label htmlFor="failed-message-input" key="failed-message-label">
            {this.props.message.failure.help}
          </label>
          <textarea type="text"
            title={this.props.message.failure.help}
            id="failed-message-input" name="failed-message-input" key="failed-message-input"
            className="form-value-element"
            readOnly="true"
            value={this.props.failedMessage}>
          </textarea>
        </div>
      </div>
    );
  },
  encodeURIMailTo: function () {
    var subject = encodeURIComponent(this.props.business.alternateName + ' contact email');
    var body = this.props.failure ? encodeURIComponent(this.props.failedMessage) : '';

    return "mailto:" + this.props.business.email + '?subject=' + subject + '&body=' + body;
  }
});

module.exports = ContactResult;
