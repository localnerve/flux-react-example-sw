/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var createStore = require('fluxible/addons').createStore;

var ContentStore = createStore({
  storeName: 'ContentStore',

  handlers: {
    'INIT_APP': 'initContent',
    'RECEIVE_PAGE_CONTENT': 'receivePageContent'
  },

  initialize: function () {
    this.contents = {};
    this.currentResource = '';
    this.defaultResource = '';
  },

  initContent: function (payload) {
    var init = payload.page;
    if (init) {
      this.defaultResource = init.defaultPageName;
      this.emitChange();
    }
  },

  receivePageContent: function (page) {
    if (!page || !page.hasOwnProperty('resource')) {
      return;
    }

    this.currentResource = page.resource;
    this.contents[page.resource] = page.data;
    this.emitChange();
  },

  get: function (resource) {
    return this.contents[resource];
  },

  getCurrentPageContent: function () {
    var resource = this.get(this.currentResource || this.defaultResource);
    if (resource) {
      return resource.content;
    }
    return null;
  },

  getCurrentPageModels: function () {
    var resource = this.get(this.currentResource || this.defaultResource);
    if (resource) {
      return resource.models;
    }
    return null;
  },

  dehydrate: function () {
    return {
      resource: this.currentResource,
      defaultResource: this.defaultResource,
      contents: this.contents
    };
  },

  rehydrate: function (state) {
    this.currentResource = state.resource;
    this.defaultResource = state.defaultResource;
    this.contents = state.contents;
  }
});

module.exports = ContentStore;
