/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var TimeoutTransitionGroup = require('timeout-transition-group');
var cx = require('classnames');
var contactAction = require('../../../actions/contact');
var ContactSteps = require('./Steps.jsx');
var ContactNav = require('./Nav.jsx');
var Spinner = require('../Spinner.jsx');
var elements = require('./elements');

// manually keep in sync with value in _anim.scss
var animTimeout = 500;

var Contact = React.createClass({
  contextTypes: {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired
  },

  propTypes: {
    name: React.PropTypes.string,
    spinner: React.PropTypes.bool,
    headingText: React.PropTypes.string,
    stepFinal: React.PropTypes.number,
    steps: React.PropTypes.array,
    resultMessageFail: React.PropTypes.string,
    resultMessageSuccess: React.PropTypes.string,
    navigation: React.PropTypes.object
  },

  getInitialState: function () {
    var state = this.getStateFromStore();
    state.step = 0;
    state.stepped = false;
    state.direction = 'next';
    state.settled = true;
    return state;
  },

  componentDidMount: function () {
    this.context.getStore('ContactStore').addChangeListener(this.onChange);
  },

  componentWillUnmount: function () {
    this.context.getStore('ContactStore').removeChangeListener(this.onChange);
  },

  componentWillReceiveProps: function () {
    this.setState({
      stepped: false
    }, this.setBlur);
  },

  render: function () {
    var content;

    if (this.props.spinner || !this.state.settled) {
      content = React.createElement(Spinner);
    } else {
      content = this.renderContact();
    }

    return (
      <div className="grid-container-center page-content">
        {content}
      </div>
    );
  },

  getStateFromStore: function () {
    var store = this.context.getStore('ContactStore');
    return {
      fields: store.getContactFields(),
      failure: store.getContactFailure()
    };
  },

  setInputElement: function (component) {
    if (component) {
      this.inputElement = component;
    }
  },

  renderContact: function () {
    if (!this.props.steps || this.props.steps.length === 0) {
      return null;
    }

    var step = this.props.steps[this.state.step];

    var contactElement = elements.createElement(step.name, {
      fieldValue: this.state.fields[step.name] || null,
      setInputReference: this.setInputElement,
      label: step.label,
      key: step.name,
      message: step.message,
      business: this.props.models.LocalBusiness,
      failure: this.state.failure,
      failedMessage: this.state.fields.message,
      focus: this.props.name === 'contact' && this.state.stepped,
    });

    return (
      <div key="contact">
        <h2>
          {this.props.headingText}
        </h2>
        <p className={cx({
          'contact-intro': true,
          hide: this.state.step === this.props.stepFinal
          })}>
          {step.introduction.text}
        </p>
        <ContactSteps
          steps={this.props.steps}
          stepCurrent={this.state.step}
          stepFinal={this.props.stepFinal}
          failure={this.state.failure}
          resultMessage={this.state.failure ? this.props.resultMessageFail :
            this.props.resultMessageSuccess}
          retry={this.handleRetry} />
        <form className="contact-form" onSubmit={this.handleSubmit}>
          <TimeoutTransitionGroup
            component="div"
            className={cx({
              'contact-anim-container': true,
              'final': this.state.step === this.props.stepFinal
            })}
            enterTimeout={animTimeout}
            leaveTimeout={animTimeout}
            transitionEnter={this.state.step < this.props.stepFinal}
            transitionLeave={false}
            transitionName={'contact-anim-' + this.state.direction}>
            <div className="contact-anim" key={step.name}>
              {contactElement}
            </div>
          </TimeoutTransitionGroup>
          <ContactNav
            stepCurrent={this.state.step}
            stepFinal={this.props.stepFinal}
            onPrevious={this.handlePrevious}
            nav={this.props.navigation} />
        </form>
      </div>
    );
  },

  setBlur: function () {
    setTimeout(function (self, final) {
      if (!final && self.inputElement) {
        var el = React.findDOMNode(self.inputElement);
        el.blur();
      }
    }, 0, this, this.state.step === this.props.stepFinal);
  },

  onChange: function () {
    var state = this.getStateFromStore();
    state.settled = true;
    this.setState(state);
  },

  saveFields: function (fields) {
    var complete = this.state.step === (this.props.stepFinal - 1);

    this.setState({
      settled: !complete
    }, function () {
      this.context.executeAction(contactAction, {
        fields: fields,
        complete: complete
      });
    });
  },

  nextStep: function () {
    this.setState({
      step: this.state.step + 1,
      direction: 'next',
      stepped: true
    });
  },

  prevStep: function (done) {
    this.setState({
      step: this.state.step - 1,
      direction: 'prev',
      stepped: true
    });
  },

  handleRetry: function () {
    this.setState({
      settled: false
    }, function () {
      this.context.executeAction(contactAction, {
        fields: this.state.fields,
        complete: true
      });
    });
  },

  handleSubmit: function (event) {
    event.preventDefault();
    var step = this.props.steps[this.state.step];

    var fieldValue = React.findDOMNode(this.inputElement).value.trim();
    if (!fieldValue) {
      return;
    }

    var fields = this.state.fields;
    fields[step.name] = fieldValue;

    this.saveFields(fields);
    this.nextStep();
  },

  handlePrevious: function (event) {
    event.preventDefault();
    this.prevStep();
  }
});

module.exports = Contact;
