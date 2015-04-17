/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var FluxibleMixin = require('fluxible/addons/FluxibleMixin');
var ContactStore = require('../../stores/ContactStore');
var contactAction = require('../../actions/contact');
var cx = require('classnames');
var STEP_FINAL = 3;

var Contact = React.createClass({
  mixins: [ FluxibleMixin ],
  statics: {
    storeListeners: [ ContactStore ]
  },

  getInitialState: function () {
    var state = this._getStateFromStore();
    state.step = 0;
    return state;
  },
  render: function () {
    var contactSteps = '', contactElements = '';

    if (this.props.steps) {
      contactSteps = this._renderContactSteps();
      contactElements = this._renderContactElements();
    }

    return (
      <div className="page">
        <div className="grid-container-center page-content">
          <h2>{this.props.headingText}</h2>
          <p>{this.props.introductionText}</p>
          <div className="contact-steps">
            {contactSteps}
          </div>
          {contactElements}
        </div>
      </div>
    );
  },
  onChange: function () {
    this.setState(this._getStateFromStore());
  },

  _saveFields: function (fields) {
    this.executeAction(contactAction, {
      fields: fields,
      complete: (this.state.step === (STEP_FINAL - 1))
    });
  },
  _getStateFromStore: function () {
    return {
      fields: this.getStore(ContactStore).getContactFields()
    };
  },
  _nextStep: function () {
    this.setState({
      step: this.state.step + 1
    });
  },
  _prevStep: function () {
    this.setState({
      step: this.state.step - 1
    });
  },
  _renderContactElements: function () {
    var self = this;
    // make a copy
    var step = JSON.parse(JSON.stringify(this.props.steps[this.state.step]));

    if (step.step < STEP_FINAL) {
      step.container.props.onSubmit = this._handleSubmit;
      step.elements[step.valueElement].props.defaultValue = this.state.fields[step.name] || null;
      if (step.previousElement >= 0) {
        step.elements[step.previousElement].props.onClick = this._handlePrevious;
      }
    }

    var children = [
      React.createElement(
        step.description.tagName,
        step.description.props,
        step.description.text
      )
    ].concat(step.elements.map(function (element) {
        return React.createElement(
          element.tagName,
          element.props,
          element.text
        );
      })
    );

    return React.createElement(
      step.container.tagName, step.container.props, children
    );
  },
  _renderContactSteps: function () {
    var self = this;
    return this.props.steps
      .sort(function (a, b) {
        return a.step - b.step;
      })
      .map(function (input) {
        var classNames = cx({
          complete: input.step < self.state.step,
          current: input.step === self.state.step,
          incomplete: input.step > self.state.step,
          hide: input.step === STEP_FINAL
        });
        return (
          <span className={classNames} key={input.name}>
            {input.name}
          </span>
        );
      });
  },
  _handleSubmit: function (event) {
    event.preventDefault();
    var step = this.props.steps[this.state.step];

    var fieldValue = React.findDOMNode(this.refs[step.name]).value.trim();
    if (!fieldValue) {
      return;
    }

    var fields = this.state.fields;
    fields[step.name] = fieldValue;

    this._saveFields(fields);
    this._nextStep();
  },
  _handlePrevious: function (event) {
    event.preventDefault();
    this._prevStep();
  }
});

module.exports = Contact;