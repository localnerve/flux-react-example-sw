/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global window, document */
'use strict';

var React = require('react');

var Background = React.createClass({
  propTypes: {
    pageOrdinal: React.PropTypes.number.isRequired,
    pageSelector: React.PropTypes.string.isRequired
  },

  statics: {
    // Form a lorempixel request
    getImageUrl: function (page, pageSelector) {
      var width = document.documentElement.clientWidth;
      // 60 is the height of the navigation, hardcoded for now
      var navHeight = 60;
      var pageElement = document.querySelector(pageSelector);
      var height = pageElement ?
        pageElement.clientHeight + navHeight : document.documentElement.clientHeight;

      var theme = 'nature';

      return 'http://lorempixel.com/'+width+'/'+height+'/'+theme+'/'+
        ((page+3) % 10)+'/';
    }
  },

  getInitialState: function () {
    return {
      loaded: false,
      src: ''
    };
  },

  render: function () {
    return (
      <div className="app-bg" style={{
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(' + this.state.src + ')',
        opacity: this.state.loaded ? 1 : 0
      }}></div>
    );
  },

  fetchImage: function (ordinal, selector) {
    var self = this;
    var img = document.createElement('img');

    img.onload = function () {
      setTimeout(function () {
        if (typeof document !== 'undefined') {
          self.setState({
            loaded: true,
            src: img.src
          });
        }
      }, 200);
    };

    img.src = Background.getImageUrl(ordinal, selector);
  },

  fadeImageOutIn: function (ordinal, selector) {
    this.setState({
      loaded: false
    });
    this.fetchImage(ordinal, selector);
  },

  handleResize: function () {
    this.fadeImageOutIn(this.props.pageOrdinal, this.props.pageSelector);
  },

  componentDidMount: function () {
    this.fetchImage(this.props.pageOrdinal, this.props.pageSelector);
    window.addEventListener('resize', this.handleResize);
  },

  componentWillUnmount: function () {
    window.removeEventListener('resize', this.handleResize);
  },

  componentWillReceiveProps: function (nextProps) {
    this.fadeImageOutIn(nextProps.pageOrdinal, nextProps.pageSelector);
  }
});

module.exports = Background;
