/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * A higher order component to report rendered client size.
 */
/* global document, window */
'use strict';

var React = require('react');
var sizeAction = require('../actions/size');

var reporters = 0;
var callCount = 0;

function reportRenderedSize (Component, selector, options) {
  options = options || {};
  reporters++;

  var SizeReporter = React.createClass({
    contextTypes: {
      executeAction: React.PropTypes.func.isRequired
    },

    render: function () {
      return React.createElement(Component, this.props);
    },

    componentDidMount: function () {
      window.addEventListener('resize', this.reportSize);
      this.reportSize();
    },

    componentWillUnmount: function () {
      window.removeEventListener('resize', this.reportSize);
    },

    reportSize: function () {
      var el = document.querySelector(selector);

      var width;
      if (options.reportWidth) {
        width = el ? el.clientWidth : null;
      }

      var top;
      if (options.reportTop) {
        var rect = el ? el.getBoundingClientRect() : { top: 0 };
        top = rect.top + window.pageYOffset - document.documentElement.clientTop;
      }

      this.context.executeAction(sizeAction, {
        height: el ? el.clientHeight : null,
        width: width,
        top: top,
        add: callCount % reporters !== 0
      });
      callCount++;
    }
  });

  return SizeReporter;
}

module.exports  = reportRenderedSize;
