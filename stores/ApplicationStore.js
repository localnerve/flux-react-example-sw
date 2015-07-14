/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var createStore = require('fluxible/addons').createStore;

var ApplicationStore = createStore({
  storeName: 'ApplicationStore',

  handlers: {
    'INIT_APP': 'initApplication',
    'UPDATE_PAGE_TITLE': 'updatePageTitle'
  },

  initialize: function (dispatcher) {
    this.currentPageTitle = '';
    this.defaultPageName = '';
  },

  initApplication: function (payload) {
    var init = payload.page;
    if (init) {
      this.defaultPageName = init.defaultPageName;
      this.emitChange();
    }
  },

  updatePageTitle: function (page) {
    this.currentPageTitle = page.title;
    this.emitChange();
  },

  getDefaultPageName: function () {
    return this.defaultPageName;
  },

  getCurrentPageTitle: function () {
    return this.currentPageTitle;
  },

  dehydrate: function () {
    return {
      pageTitle: this.currentPageTitle,
      defaultPageName: this.defaultPageName
    };
  },

  rehydrate: function (state) {
    this.currentPageTitle = state.pageTitle;
    this.defaultPageName = state.defaultPageName;
  }
});

module.exports = ApplicationStore;
