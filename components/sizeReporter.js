/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * A higher order component to report a rendered client size.
 *
 * In this example, this is used to report size in the retrieval of the background
 * image to avoid extra bandwidth and expensive image scaling on a limited device.
 * Everytime you invalidate an area with a scaled image, you incur the scaling cost.
 */
/* global document, window */
'use strict';

var React = require('react');
var sizeAction = require('../actions/size');

/***
 * reporters and callCounts.
 *
 * A count of reporters is accumulated each time the factory below is called to
 * create a size reporter.
 * When all the reporters finish reporting (and initially),
 *   callCount % reporters === 0.
 * This is used to determine if dimensions should be accumulated (add === true).
 * They should be accumulated when reporters have not all reported.
 *
 * Unscoped, these assume there is only one thing in the app to report size about.
 * Not so scalable/repeatable/reusable this way.
 * If the app had multiple items to report size on, this component would need
 * a key to distinguish a scope for reporters and their callCounts.
 * This key would also be of interest to the appropriate store.
 */
var reporters = 0;
var callCount = 0;

/**
 * Factory to create a high order React component to report size changes.
 *
 * @param {Object} Component - The React class the size reporter wraps.
 * @param {String} selector - The selector used to find the DOM element to report on.
 * @param {Object} options - Options to control what gets reported.
 * @returns {Object} A SizeReporter React class that renders the given `Component`,
 * reporting on DOM element found at `selector`.
 */
function reportRenderedSize (Component, selector, options) {
  options = options || {};
  reporters++;

  var SizeReporter = React.createClass({
    contextTypes: {
      executeAction: React.PropTypes.func.isRequired
    },

    /**
     * Round a number according to rules.
     *
     * If options.cover specified, uses 'type' to go to lower or upper bound.
     * If a 'type' specified in options.cover as Object, then use specified units.
     *
     * Otherwise, just go to nearest (plain round).
     *
     * Coverage rules:
     *   upper = ceil, lower = floor, nearest = round.
     *   top = lower; width/height = upper.
     *
     * @param {String} type - Can be one of 'top', 'width', or 'height'.
     * @param {Number} value - The raw value.
     */
    round: function (type, value) {
      var unit = 1.0, roundOp = Math.round;

      if (options.cover) {
        roundOp = Math[type === 'top' ? 'floor' : 'ceil'];
        if ('object' === typeof options.cover) {
          unit = options.cover[type] || 1.0;
        }
      }

      return roundOp(value / unit) * unit;
    },

    /**
     * Render the wrapped component with props.
     */
    render: function () {
      return React.createElement(Component, this.props);
    },

    /**
     * Set up the resize event listener and kick off the first report.
     */
    componentDidMount: function () {
      window.addEventListener('resize', this.reportSize);
      this.reportSize();
    },

    /**
     * Remove the resize event listener.
     */
    componentWillUnmount: function () {
      window.removeEventListener('resize', this.reportSize);
    },

    /**
     * Report the size of the DOM element found at `selector`.
     * ceil is used on clientRect to reduce the differences in width, height.
     */
    reportSize: function () {
      var width, height, top,
          el = document.querySelector(selector),
          rect = el ? el.getBoundingClientRect() :
            { top: 0, right: 0, bottom: 0, left: 0 };

      if (options.reportWidth) {
        width = this.round('width', rect.right - rect.left);
      }

      if (options.reportTop) {
        top = this.round(
          'top',
          rect.top + window.pageYOffset - document.documentElement.clientTop
        );
      }

      if (options.reportHeight) {
        height = this.round('height', rect.bottom - rect.top);
      }

      this.context.executeAction(sizeAction, {
        height: height,
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
