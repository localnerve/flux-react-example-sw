/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global window, document */
'use strict';

var React = require('react');
var connectToStores = require('fluxible/addons/connectToStores');
var provideContext = require('fluxible/addons/provideContext');
var RouterMixin = require('flux-router-component').RouterMixin;
var ReactSwipe = require('react-swipe');
var navigateAction = require('flux-router-component').navigateAction;

var pages = require('./pages');
var Header = require('./header');
var Footer = require('./footer');
var Background = require('./Background.jsx');
var PageContainer = require('./PageContainer.jsx');

var Application = React.createClass({
  mixins: [ RouterMixin ],

  contextTypes: {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired
  },

  getDefaultProps: function () {
    return {
      enableScroll: false
    };
  },

  handleSwipe: function (index) {
    if (this.props.route.config.order !== index) {
      var pages = this.props.pages;

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
      this.props.pages, this.context.getStore('ContentStore')
    );

    return (
      <div className="app-block">
        <Background prefetch={true} />
        <Header
          selected={this.props.pageName}
          links={this.props.pages}
          models={this.props.pageModels}
        />
        <PageContainer>
          <ReactSwipe
            callback={this.handleSwipe}
            startSlide={this.props.route.config.order}
            slideToIndex={this.props.route.config.order}>
            {pageElements}
          </ReactSwipe>
        </PageContainer>
        <Footer models={this.props.pageModels} />
      </div>
    );
  },

  componentDidUpdate: function (prevProps, prevState) {
    var newProps = this.props;

    if (newProps.pageTitle === prevProps.pageTitle) {
      return;
    }

    document.title = newProps.pageTitle;

    var analytics = window[newProps.analytics];
    if (analytics) {
      analytics('set', {
        page: newProps.route.url,
        title: newProps.pageTitle
      });
      analytics('send', 'pageview');
    }
  }
});

Application = connectToStores(Application, ['ApplicationStore', 'ContentStore'], function (stores) {
  return {
    pageName: stores.ApplicationStore.getCurrentPageName(),
    pageTitle: stores.ApplicationStore.getCurrentPageTitle(),
    pageModels: stores.ContentStore.getCurrentPageModels(),
    route: stores.ApplicationStore.getCurrentRoute(),
    pages: stores.ApplicationStore.getPages()
  };
});

Application = provideContext(Application);

module.exports = Application;
