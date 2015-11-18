/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global document */
'use strict';

var React = require('react');

var Background = React.createClass({
  contextTypes: {
    getStore: React.PropTypes.func.isRequired
  },

  propTypes: {
    prefetch: React.PropTypes.bool
  },

  getInitialState: function () {
    return {
      top: 0,
      height: 0,
      loaded: false
    };
  },

  render: function () {
    var gradient = 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5))';
    // Setting 'image' initially to 'none' seems to help IE 11, but it still can't
    //   change images properly - you always get the same image. #41
    // Tried all prop combos incl bg shorthand. closest was image render w/gradient,
    //   but won't change raster image - css does reflect, but browser won't render.
    // Leaving in gradient only state for IE. Best of all bad options for IE.
    var image = gradient;

    if (this.state.loaded) {
      image = gradient + ', url(' + this.state.src + ')';
    } else {
      if (this.state.prevSrc) {
        image = gradient + ', url(' + this.state.prevSrc + ')';
      }
    }

    return (
      <div className="app-bg" style={{
        top: this.state.top + 'px',
        height: this.state.height + 'px',
        opacity: this.state.loaded ? 1 : 0
      }}>
        <div style={{
          backgroundImage: image,
          willChange: 'background-image',
          height: this.state.height + 'px'
        }}>
        </div>
      </div>
    );
  },

  componentDidMount: function () {
    this.context.getStore('BackgroundStore').addChangeListener(this.onChange);
  },

  componentWillUnmount: function () {
    this.context.getStore('BackgroundStore').removeChangeListener(this.onChange);
  },

  getStateFromStore: function () {
    var store = this.context.getStore('BackgroundStore');
    return {
      src: store.getCurrentBackgroundUrl(),
      top: store.getTop(),
      height: store.getHeight()
    };
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
