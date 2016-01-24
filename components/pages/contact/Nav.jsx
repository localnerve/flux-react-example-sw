/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var cx = require('classnames');

var ContactNav = React.createClass({
  propTypes: {
    stepCurrent: React.PropTypes.number.isRequired,
    stepFinal: React.PropTypes.number.isRequired,
    onPrevious: React.PropTypes.func.isRequired,
    nav: React.PropTypes.object.isRequired
  },

  shouldComponentUpdate: function (nextProps) {
    return nextProps.stepCurrent !== this.props.stepCurrent;
  },

  render: function () {
    var last = this.props.stepCurrent === this.props.stepFinal;
    var nav = last ? [] : this.renderContactNav();

    return (
      <div className={cx({
          'form-navigation': true,
          hide: last
        })}>
        {nav}
      </div>
    );
  },

  renderContactNav: function () {
    var complete = this.props.stepCurrent === this.props.stepFinal - 1;
    var nextText = complete ? this.props.nav.next.last :
      this.props.nav.next.text;

    return [
      <button type="button"
        id="previous" name="previous" key="previous"
        value={this.props.nav.previous.text}
        title={this.props.nav.previous.help}
        className={cx({hide: this.props.stepCurrent === 0})}
        onClick={this.props.onPrevious}>
        <span>{this.props.nav.previous.text}</span>
      </button>,
      <button type="submit"
        id="submit" name="submit" key="submit"
        value={nextText}
        title={this.props.nav.next.help}
        className={cx({last: complete})}>
        <span>{nextText}</span>
      </button>
    ];
  }
});

module.exports = ContactNav;
