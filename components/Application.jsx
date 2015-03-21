/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global window, document */
'use strict';

var React = require('react');
var ApplicationStore = require('../stores/ApplicationStore');
var RouterMixin = require('flux-router-component').RouterMixin;
var FluxibleMixin = require('fluxible').FluxibleMixin;

var pages = require('./pages');
var Header = require('./header/Header.jsx');

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
      route: appStore.getCurrentRoute(),
      pages: appStore.getPages()
    };
  },
  onChange: function () {
    this.setState(this.getState());
  },
  render: function () {
    var page = React.createElement(pages(this.state.currentPageName));

    return (
      <div>
        <Header selected={this.state.currentPageName} links={this.state.pages} />
        {page}
        <footer>
          <p>This is an example page footer</p>
        </footer>
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