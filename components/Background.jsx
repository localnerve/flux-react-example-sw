/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global document */
'use strict';

var React = require('react');

var Background = React.createClass({
  propTypes: {
    pageOrdinal: React.PropTypes.number.isRequired
  },

  statics: {
    // Form a lorempixel request
    getImageUrl: function (page) {
      var width = document.documentElement.clientWidth;
      var height = document.documentElement.clientHeight;
      var theme = 'city';

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
      <div style={{
        position: 'absolute',
        top: 0, right: 0, bottom: 0, left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        backgroundImage: 'url(' + this.state.src + ')',
        backgroundSize: 'cover',
        opacity: this.state.loaded ? 0.3 : 0,
        transition: 'opacity 0.4s ease'
      }}></div>
    );
  },

  fetchImage: function (pageOrdinal) {
    var self = this;
    var img = document.createElement('img');

    img.onload = function () {
      setTimeout(function () {
        self.setState({
          loaded: true,
          src: img.src
        });
      }, 200);
    };

    img.src = Background.getImageUrl(pageOrdinal);
  },

  componentDidMount: function () {
    this.fetchImage(this.props.pageOrdinal);
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({
      loaded: false
    });
    this.fetchImage(nextProps.pageOrdinal);
  }
});

module.exports = Background;
