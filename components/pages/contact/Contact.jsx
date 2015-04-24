/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var FluxibleMixin = require('fluxible/addons/FluxibleMixin');
var ContactStore = require('../../../stores/ContactStore');
var contactAction = require('../../../actions/contact');
var cx = require('classnames');

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
          <ul className="contact-steps">
            {contactSteps}
          </ul>
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
      complete: (this.state.step === (this.props.stepFinal - 1))
    });
  },
  _getStateFromStore: function () {
    var store = this.getStore(ContactStore);
    return {
      fields: store.getContactFields(),
      failure: store.getContactFailure()
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
    // make a copy of this step
    var step = JSON.parse(JSON.stringify(this.props.steps[this.state.step]));

    if (step.step < this.props.stepFinal) {
      // wire up event handlers and value field
      step.container.props.onSubmit = this._handleSubmit;
      step.value.props.defaultValue = this.state.fields[step.name] || null;
      if (step.previousElement >= 0) {
        step.navigation.elements[step.previousElement].props.onClick = this._handlePrevious;
      }
    } else {
      if (this.state.failure) {
        step.description.text = step.description.failureText;
        step.value.text = step.value.failureText;
      }
    }

    var children = [
      React.createElement(
        step.description.tagName,
        step.description.props,
        step.description.text
      ),
      React.createElement(
        step.value.tagName,
        step.value.props,
        step.value.text
      )
    ];

    return React.createElement(
      step.container.tagName,
      step.container.props,
      !step.navigation ? children : children.concat(
        React.createElement(
          step.navigation.container.tagName,
          step.navigation.container.props,
          step.navigation.elements
          .map(function (element) {
            return React.createElement(
              element.tagName,
              element.props,
              React.createElement('span', {}, element.text)
            );
          })
        )
      )
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
          hide: input.step === self.props.stepFinal
        });
        return (
          <li className={classNames} key={input.name}>
            <span>{input.name}</span>
          </li>
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
