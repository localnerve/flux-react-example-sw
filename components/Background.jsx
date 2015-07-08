/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global document */
'use strict';

var React = require('react');

var Background = React.createClass({
  contextTypes: {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired
  },

  propTypes: {
    prefetch: React.PropTypes.bool
  },

  getStateFromStore: function () {
    var store = this.context.getStore('BackgroundStore');
    return {
      src: store.getCurrentBackgroundUrl(),
      top: store.getTop()
    };
  },

  getInitialState: function () {
    return {
      top: 0,
      loaded: false
    };
  },

  render: function () {
    var bgi =  'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5))';

    if (this.state.loaded) {
      bgi += ', url(' + this.state.src + ')';
    } else {
      if (this.state.prevSrc) {
        bgi += ', url(' + this.state.prevSrc + ')';
      }
    }

    return (
      <div className="app-bg" style={{
        backgroundImage: bgi,
        backgroundPosition: '0 ' + this.state.top + 'px',
        opacity: this.state.loaded ? 1 : 0
      }}></div>
    );
  },

  componentDidMount: function () {
    this.context.getStore('BackgroundStore').addChangeListener(this.onChange);
  },

  componentWillUnmount: function () {
    this.context.getStore('BackgroundStore').removeChangeListener(this.onChange);
  },

  fetchImage: function (fetchOnly) {
    var self = this;
    var img = document.createElement('img');

    if (!fetchOnly) {
      img.onload = function () {
        setTimeout(function () {
          if (typeof document !== 'undefined') {
            self.setState({
              loaded: true
            });
          }
        }, 200);
      };
    }

    img.src = fetchOnly || this.state.src;
  },

  prefetchImages: function () {
    if (this.props.prefetch && !this.prefetched) {
      this.context.getStore('BackgroundStore')
        .getNotCurrentBackgroundUrls()
        .forEach(function (notCurrentUrl) {
          this.fetchImage(notCurrentUrl);
        }, this);

      this.prefetched = true;
    }
  },

  onChange: function () {
    var state = this.getStateFromStore();
    state.prevSrc = this.state.src;
    state.loaded = false;

    this.setState(state);
    this.fetchImage();

    this.prefetchImages();
  }
});

module.exports = Background;
