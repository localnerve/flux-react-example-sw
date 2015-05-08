/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var createStore = require('fluxible/addons').createStore;

var ContentStore = createStore({
  storeName: 'ContentStore',
  handlers: {
    'RECEIVE_PAGE_CONTENT': 'receivePageContent'
  },
  initialize: function () {
    this.contents = {};
    this.currentResource = '';
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
    return this.get(this.currentResource).content;
  },
  getCurrentPageModels: function () {
    return this.get(this.currentResource).models;
  },
  dehydrate: function () {
    return {
      resource: this.currentResource,
      contents: this.contents
    };
  },
  rehydrate: function (state) {
    this.currentResource = state.resource;
    this.contents = state.contents;
  }
});

module.exports = ContentStore;
