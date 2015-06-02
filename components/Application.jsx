/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global window, document */
'use strict';

var React = require('react');
var ApplicationStore = require('../stores/ApplicationStore');
var ContentStore = require('../stores/ContentStore');
var RouterMixin = require('flux-router-component').RouterMixin;
var FluxibleMixin = require('fluxible/addons/FluxibleMixin');
var ReactSwipe = require('react-swipe');
var navigateAction = require('flux-router-component').navigateAction;

var pages = require('./pages');
var Header = require('./header');
var Footer = require('./footer');

var Application = React.createClass({
  mixins: [ RouterMixin, FluxibleMixin ],
  statics: {
    storeListeners: [ ApplicationStore ]
  },

  getDefaultProps: function () {
    return {
      enableScroll: false
    };
  },
  getInitialState: function () {
    return this.getState();
  },
  getState: function () {
    var appStore = this.getStore(ApplicationStore);
    var contentStore = this.getStore(ContentStore);

    return {
      pageName: appStore.getCurrentPageName(),
      pageTitle: appStore.getCurrentPageTitle(),
      pageModels: contentStore.getCurrentPageModels(),
      route: appStore.getCurrentRoute(),
      pages: appStore.getPages()
    };
  },
  onChange: function () {
    this.setState(this.getState());
  },
  handleSwipe: function (index) {
    if (this.state.route.config.order !== index) {
      var pages = this.state.pages;

      var nextPageName = Object.keys(pages).filter(function (page) {
        return pages[page].order === index;
      })[0];

      this.context.executeAction(navigateAction, {
        name: nextPageName,
        url: pages[nextPageName].path,
        config: pages[nextPageName]
      });
    }
  },
  render: function () {
    var pageElements = pages.createElements(
      this.state.pages, this.getStore(ContentStore)
    );

    return (
      <div className="app-block">
        <Header
          selected={this.state.pageName}
          links={this.state.pages}
          models={this.state.pageModels}
        />
        <div className="page">
          <ReactSwipe
            callback={this.handleSwipe}
            startSlide={this.state.route.config.order}
            slideToIndex={this.state.route.config.order}>
            {pageElements}
          </ReactSwipe>
        </div>
        <Footer models={this.state.pageModels} />
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
