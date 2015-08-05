/***
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

  /**
   * Set ContentStore initial state.
   */
  initialize: function () {
    this.contents = {};
    this.currentResource = '';
    this.defaultResource = '';
  },

  /**
   * INIT_APP handler.
   *
   * @param {Object} payload - INIT_APP action payload.
   * @param {Object} payload.page - Content data this Store is intereseted in.
   * @param {String} payload.page.defaultPageName - The default resource.
   */
  initContent: function (payload) {
    var init = payload.page;
    if (init) {
      this.defaultResource = init.defaultPageName;
      this.emitChange();
    }
  },

  /**
   * RECEIVE_PAGE_CONTENT handler.
   *
   * @param {Object} page - RECEIVE_PAGE_CONTENT action payload.
   * @param {String} page.resource - The current resource and the key to its data.
   * @param {Object} page.data - The page data, containing models and content.
   */
  receivePageContent: function (page) {
    if (!page || !page.hasOwnProperty('resource')) {
      return;
    }

    this.currentResource = page.resource;
    this.contents[page.resource] = page.data;
    this.emitChange();
  },

  /**
   * Get content and models for the given arbitrary resource.
   *
   * @param {String} resource - The resource to get (The key).
   * @returns {Object} Content and models for the given resource, or undefined if not found.
   */
  get: function (resource) {
    return this.contents[resource];
  },

  /**
   * Get the page content for the current resource.
   * If the current resource is not defined, use the defaultResource.
   *
   * @returns {Object|String} the current page content or null if not found.
   */
  getCurrentPageContent: function () {
    var resource = this.get(this.currentResource || this.defaultResource);
    if (resource) {
      return resource.content;
    }
    return null;
  },

  /**
   * Get the page models for the current resource.
   * If the current resource is not defined, use the deafultResource.
   *
   * @returns {Object} the current page models or null if not found.
   */
  getCurrentPageModels: function () {
    var resource = this.get(this.currentResource || this.defaultResource);
    if (resource) {
      return resource.models;
    }
    return null;
  },

  /**
   * Reduce this store to state.
   *
   * @returns {Object} this store as state.
   */
  dehydrate: function () {
    return {
      resource: this.currentResource,
      defaultResource: this.defaultResource,
      contents: this.contents
    };
  },

  /**
   * Hydrate this store from state.
   *
   * @param {Object} state - The new ContentStore state.
   */
  rehydrate: function (state) {
    this.currentResource = state.resource;
    this.defaultResource = state.defaultResource;
    this.contents = state.contents;
  }
});

module.exports = ContentStore;
