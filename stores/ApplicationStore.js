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
    'UPDATE_PAGE': 'updatePage',
    'RECEIVE_ROUTES': 'receiveRoutes'
  },
  initialize: function (dispatcher) {
    this.currentPageId = null;
    this.currentPageName = null;
    this.currentRoute = null;
    this.currentPageTitle = '';
    this.pages = {};
    
    // this.contents = {};
    
    this.currentPageContent = '';
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
  updatePage: function(page) {
    this.currentPageTitle = page.title;
    
    // this.contents[this.currentPageName] = page.content;
    
    this.currentPageContent = page.content;
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
  // getContents: function() {
  //  return this.contents;
  // },
  getCurrentPageContent: function() {
    // return this.contents[this.currentPageName];
    return this.currentPageContent;
  },
  getCurrentPageName: function () {
    return this.currentPageName;
  },
  getCurrentPageTitle: function () {
    return this.currentPageTitle;
  },
  getCurrentRoute: function () {
    return this.currentRoute;
  },
  dehydrate: function () {    
    return {
      pageName: this.currentPageName,      
      route: this.currentRoute,
      pageTitle: this.currentPageTitle,
      pages: transformers.fluxibleToJson(this.pages),
      // contents: this.contents,
      content: this.currentPageContent
    };
  },
  rehydrate: function (state) {
    this.currentPageName = state.pageName;    
    this.currentRoute = state.route;
    this.currentPageTitle = state.pageTitle;
    this.pages = transformers.jsonToFluxible(state.pages);
    // this.contents = state.contents;
    this.currentPageContent = state.content;
  }
});

module.exports = ApplicationStore;