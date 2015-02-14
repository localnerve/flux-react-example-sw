/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global document, ga */
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
    // var docStore = this.getStore(DocStore);
    return {
      // currentDoc: docStore.getCurrent() || {},
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
      </div>
    );
  },

  componentDidUpdate: function (prevProps, prevState) {
    var newState = this.state;

    if (newState.pageTitle === prevState.pageTitle) {
      return;
    }

    document.title = newState.pageTitle;

    // log pageview
    if (ga) {
      ga('set', {
        page: newState.route.url,
        title: newState.pageTitle
      });
      ga('send', 'pageview');
    }
  }
});

module.exports = Application;