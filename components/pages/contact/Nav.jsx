/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var cx = require('classnames');

var ContactNav = React.createClass({
  propTypes: {
    navFormKey: React.PropTypes.string.isRequired,
    stepCurrent: React.PropTypes.number.isRequired,
    stepFinal: React.PropTypes.number.isRequired,
    onPrevious: React.PropTypes.func.isRequired
  },
  getDefaultProps: function () {
    return {
      navFormKey: 'nav-form',
      stepCurrent: 0,
      stepFinal: 0,
      onPrevious: function () {}
    };
  },
  render: function () {
    var last = this.props.stepCurrent === this.props.stepFinal;
    var nav = last ? [] : this.renderContactNav();

    return (
      <div className={cx({
          'form-navigation': true,
          hide: last
        })}
        key={this.props.navFormKey}>
        {nav}
      </div>
    );
  },
  renderContactNav: function () {
    var complete = this.props.stepCurrent === this.props.stepFinal - 1;
    var lastText = complete ? 'Submit' : 'Next';

    return [
      <button type="button"
        id="previous" name="previous" key="previous" value="Back"
        title="Press here if you would like to go back to the previous form"
        className={cx({hide: this.props.stepCurrent === 0})}
        onClick={this.props.onPrevious}>
        <span>Back</span>
      </button>,
      <button type="submit"
        id="submit" name="submit" key="submit" value={lastText}
        title="Press here after you've filled out all form elements">
        <span>{lastText}</span>
      </button>
    ];
  }
});

module.exports = ContactNav;
