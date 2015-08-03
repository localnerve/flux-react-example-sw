/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global window, document */
'use strict';

var debug = require('debug')('Example:Application.jsx');
var React = require('react');
var connectToStores = require('fluxible-addons-react/connectToStores');
var provideContext = require('fluxible-addons-react/provideContext');
var handleHistory = require('fluxible-router').handleHistory;
var navigateAction = require('fluxible-router').navigateAction;
var ReactSwipe = require('react-swipe');

var pages = require('./pages');
var Header = require('./header');
var Footer = require('./footer');
var Background = require('./Background.jsx');
var PageContainer = require('./PageContainer.jsx');

var Application = React.createClass({
  contextTypes: {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired
  },

  handleSwipe: function (index) {
    var pages = this.props.pages;
    if (pages[this.props.pageName].order !== index) {
      var nextPageName = Object.keys(pages).filter(function (page) {
        return pages[page].order === index && pages[page].mainNav;
      })[0];

      this.context.executeAction(navigateAction, {
        name: nextPageName,
        url: pages[nextPageName].path
      });
    }
  },

  render: function () {
    debug('pageName', this.props.pageName);
    debug('pages', this.props.pages);
    debug('navigateError', this.props.currentNavigateError);

    var routeOrdinal = this.props.pages[this.props.pageName].order;

    var navPages = pages.getMainNavPages(
      this.props.currentNavigateError,
      this.props.pages,
      routeOrdinal
    );

    var pageElements = pages.createElements(
      navPages, this.context.getStore('ContentStore')
    );

    return (
      <div className="app-block">
        <Background prefetch={true} />
        <Header
          selected={navPages[routeOrdinal].page}
          links={navPages}
          models={this.props.pageModels}
        />
        <PageContainer>
          <ReactSwipe
            className="swipe-container"
            callback={this.handleSwipe}
            startSlide={routeOrdinal}
            slideToIndex={routeOrdinal}>
            {pageElements}
          </ReactSwipe>
        </PageContainer>
        <Footer models={this.props.pageModels} />
      </div>
    );
  },

  shouldComponentUpdate: function (nextProps) {
    return nextProps.navigateComplete && this.props.navigateComplete;
  },

  componentDidUpdate: function () {
    document.title = this.props.pageTitle;

    var analytics = window[this.props.analytics];
    if (analytics) {
      analytics('set', {
        page: this.props.pages[this.props.pageName].path,
        title: this.props.pageTitle
      });
      analytics('send', 'pageview');
    }
  }
});

Application = connectToStores(
  Application, ['ApplicationStore', 'ContentStore', 'RouteStore'],
  function (context) {
    var routeStore = context.getStore('RouteStore'),
        appStore = context.getStore('ApplicationStore'),
        currentRoute = routeStore.getCurrentRoute(),
        pageName = (currentRoute && currentRoute.get('page')) ||
          appStore.getDefaultPageName();

    return {
      navigateComplete: routeStore.isNavigateComplete(),
      pageName: pageName,
      pageTitle: appStore.getCurrentPageTitle(),
      pageModels: context.getStore('ContentStore').getCurrentPageModels(),
      pages: routeStore.getRoutes()
    };
});

Application = handleHistory(Application, {
  enableScroll: false
});

Application = provideContext(Application);

module.exports = Application;
