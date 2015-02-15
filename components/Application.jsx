/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global window, document */
'use strict';

var React = require('react');
var ApplicationStore = require('../stores/ApplicationStore');
var RouterMixin = require('flux-router-component').RouterMixin;
var FluxibleMixin = require('fluxible').Mixin;

var Application = React.createClass({
  mixins: [ RouterMixin, FluxibleMixin ],
  statics: {
    storeListeners: [ ApplicationStore ]
  },

  getInitialState: function () {
    return this.getState();
  },
  getState: function () {
    var appStore = this.getStore(ApplicationStore);
    return {
      currentPageName: appStore.getCurrentPageName(),
      pageTitle: appStore.getPageTitle(),
      route: appStore.getCurrentRoute()
    };
  },
  onChange: function () {
    this.setState(this.getState());
  },
  render: function () {
    return (
      <div>
        <h1>Hello World</h1>
        <p>
        This is an example of an isomorphic Flux/React application. It employs Yahoo's 
        <a href="http://fluxible.io">Fluxible</a> architecture.
        </p>
        <p>
        As I'm just starting out, the UI is not built yet. Stay tuned for more as I figure it out.
        </p>
      </div>
    );
  },

  componentDidUpdate: function (prevProps, prevState) {
    var newState = this.state;

    if (newState.pageTitle === prevState.pageTitle) {
      return;
    }

    document.title = newState.pageTitle;

    var analytics = window[this.props.analytics];
    if (analytics) {
      analytics('set', {
        page: newState.route.url,
        title: newState.pageTitle
      });
      analytics('send', 'pageview');
    }
  }
});

module.exports = Application;