/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global document */
'use strict';

var React = require('react');
var FluxibleMixin = require('fluxible/addons/FluxibleMixin');
var BackgroundStore = require('../stores/BackgroundStore');
var backgroundAction = require('../actions/backgrounds');

var Background = React.createClass({
  mixins: [ FluxibleMixin ],
  statics: {
    storeListeners: [ BackgroundStore ]
  },
/*
 * TODO: switch to higher order composition (all components)
 *
  contextTypes: {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired
  },
*/
  propTypes: {
    current: React.PropTypes.number.isRequired,
    backgrounds: React.PropTypes.array.isRequired,
    prefetch: React.PropTypes.bool
  },

  getInitialState: function () {
    return {
      loaded: false,
      top: 0,
      src: ''
    };
  },

  render: function () {
    var bgi =  'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(' +
      this.state.src +
    ')';

    return (
      <div className="app-bg" style={{
        backgroundImage: bgi,
        backgroundPosition: '0 ' + this.state.top + 'px',
        opacity: this.state.loaded ? 1 : 0
      }}></div>
    );
  },

  fetchImage: function (background, fetchOnly) {
    var self = this;
    var img = document.createElement('img');

    if (!fetchOnly) {
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
    }

    img.src = this.getStore(BackgroundStore).getBackgroundUrl(background);
  },

  fadeImageOutIn: function (background) {
    this.setState({
      loaded: false,
      top: this.getStore(BackgroundStore).getTop()
    });
    this.fetchImage(background);
  },

  onChange: function () {
    this.fadeImageOutIn(this.props.current);

    if (this.props.prefetch) {
      this.props.backgrounds.filter(function (item) {
        return item !== this.props.current;
      }, this).forEach(function (item) {
        this.fetchImage(item, true);
      }, this);
    }
  },

  componentDidMount: function () {
    this.executeAction(backgroundAction, {
      backgrounds: this.props.backgrounds
    });
  },

  componentWillReceiveProps: function (nextProps) {
    this.fadeImageOutIn(nextProps.current);
  }
});

module.exports = Background;
