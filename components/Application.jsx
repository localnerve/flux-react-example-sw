/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global window, document */
'use strict';

var React = require('react');
var connectToStores = require('fluxible/addons/connectToStores');
var provideContext = require('fluxible/addons/provideContext');
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
    var routeOrdinal = this.props.pages[this.props.pageName].order;

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
    return (
      this.props.pageName && nextProps.pageName &&
      this.props.pageName !== nextProps.pageName
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
        page: newProps.pages[newProps.pageName].path,
        title: newProps.pageTitle
      });
      analytics('send', 'pageview');
    }
  }
});

Application = connectToStores(
  Application, ['ApplicationStore', 'ContentStore', 'RouteStore'],
  function (stores) {
    return {
      pageName: stores.ApplicationStore.getCurrentPageName(),
      pageTitle: stores.ApplicationStore.getCurrentPageTitle(),
      pageModels: stores.ContentStore.getCurrentPageModels(),
      pages: stores.RouteStore.getRoutes()
    };
});

Application = handleHistory(Application, {
  enableScroll: false
});

Application = provideContext(Application);

module.exports = Application;
