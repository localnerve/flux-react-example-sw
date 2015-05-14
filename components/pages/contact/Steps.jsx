/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var cx = require('classnames');

var ContactSteps = React.createClass({
  propTypes: {
    steps: React.PropTypes.array.isRequired,
    stepCurrent: React.PropTypes.number.isRequired,
    stepFinal: React.PropTypes.number.isRequired
  },
  getDefaultProps: function () {
    return {
      steps: [],
      stepCurrent: 0,
      stepFinal: 0
    };
  },
  render: function () {
    var contactSteps = this.renderContactSteps();
    return (
      <ul className="contact-steps">
        {contactSteps}
      </ul>
    );
  },
  renderContactSteps: function () {
    return this.props.steps
      .sort(function (a, b) {
        return a.step - b.step;
      })
      .map(function (input) {
        var classNames = cx({
          complete: input.step < this.props.stepCurrent,
          current: input.step === this.props.stepCurrent,
          incomplete: input.step > this.props.stepCurrent,
          hide: input.step === this.props.stepFinal
        });
        return (
          <li className={classNames} key={input.name}>
            <span>{input.name}</span>
          </li>
        );
      }, this);
  }
});

module.exports = ContactSteps;
