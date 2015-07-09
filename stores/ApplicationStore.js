/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var createStore = require('fluxible/addons').createStore;
var after = require('lodash/function/after');

var ApplicationStore = createStore({
  storeName: 'ApplicationStore',

  handlers: {
    'NAVIGATE_SUCCESS': 'handleNavigate',
    'UPDATE_PAGE_TITLE': 'updatePageTitle'
  },

  initialize: function (dispatcher) {
    this.currentPageName = null;
    this.currentPageTitle = '';

    this.pageChange = after(2, function pageChange () {
      this.emitChange();
    }.bind(this));
  },

  handleNavigate: function (route) {
    this.currentPageName = route.get('page');
    this.pageChange();
  },

  updatePageTitle: function (page) {
    this.currentPageTitle = page.title;
    this.pageChange();
  },

  getCurrentPageName: function () {
    return this.currentPageName;
  },

  getCurrentPageTitle: function () {
    return this.currentPageTitle;
  },

  dehydrate: function () {
    return {
      pageName: this.currentPageName,
      pageTitle: this.currentPageTitle
    };
  },

  rehydrate: function (state) {
    this.currentPageName = state.pageName;
    this.currentPageTitle = state.pageTitle;
  }
});

module.exports = ApplicationStore;
