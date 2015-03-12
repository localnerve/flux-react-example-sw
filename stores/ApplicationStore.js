/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var createStore = require('fluxible/addons').createStore;
var transformers = require('../utils/transformers');

var ApplicationStore = createStore({
  storeName: 'ApplicationStore',
  routesEvent: 'receivedRoutes',
  handlers: {
    'CHANGE_ROUTE_SUCCESS': 'handleNavigate',
    'UPDATE_PAGE_TITLE': 'updatePageTitle',
    'RECEIVE_ROUTES': 'receiveRoutes'
  },
  initialize: function (dispatcher) {
    this.currentPageId = null;
    this.currentPageName = null;
    this.currentRoute = null;
    this.pages = {};
    this.pageTitle = '';
  },
  handleNavigate: function (route) {
    var pageId = route.params.key;
    var pageName = route.config.page;

    if (pageName === this.currentPageName && pageId === this.currentPageId) {
      return;
    }

    this.currentPageId = pageId;
    this.currentPageName = pageName;
    this.currentRoute = route;
    this.emitChange();
  },
  updatePageTitle: function (title) {
    this.pageTitle = title.pageTitle;
    this.emitChange();
  },
  receiveRoutes: function(routes) {
    this.pages = routes;
    this.emit(ApplicationStore.routesEvent, { routes: routes });
    this.emitChange();
  },
  getPages: function() {
    return this.pages;
  },
  getCurrentPageName: function () {
    return this.currentPageName;
  },
  getPageTitle: function () {
    return this.pageTitle;
  },
  getCurrentRoute: function () {
    return this.currentRoute;
  },
  dehydrate: function () {    
    return {
      currentPageName: this.currentPageName,
      pages: transformers.fluxibleToJson(this.pages),
      route: this.currentRoute,
      pageTitle: this.pageTitle
    };
  },
  rehydrate: function (state) {
    this.currentPageName = state.currentPageName;
    this.pages = transformers.jsonToFluxible(state.pages);
    this.currentRoute = state.route;
    this.pageTitle = state.pageTitle;
  }
});

module.exports = ApplicationStore;