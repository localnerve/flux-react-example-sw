/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var createStore = require('fluxible/addons').createStore;
var debounce = require('lodash/function/debounce');
var buildImageUrl = require('../utils').buildImageUrl;

var BackgroundStore = createStore({
  storeName: 'BackgroundStore',

  handlers: {
    'UPDATE_SIZE': 'updateSize',
    'INIT_APP': 'initBackgrounds',
    'NAVIGATE_SUCCESS': 'updateBackground'
  },

  initialize: function () {
    this.width = 0;
    this.height = 0;
    this.top = 0;
    this.currentBackground = '';
    this.imageServiceUrl = '';
    this.backgroundUrls = {};

    this.sizeChange = debounce(function sizeChange () {
      this.updateBackgroundUrls({
        backgrounds: Object.keys(this.backgroundUrls)
      });
      this.emitChange();
    }.bind(this), 50);
  },

  updateSize: function (payload) {
    if (payload.add) {
      this.width += payload.width || 0;
      this.height += payload.height || 0;
    } else {
      this.width = payload.width || 0;
      this.height = payload.height || 0;
    }
    if (payload.top) {
      this.top = payload.top;
    }
    this.sizeChange();
  },

  initBackgrounds: function (payload) {
    var init = payload.backgrounds;
    if (init) {
      this.imageServiceUrl = init.serviceUrl;
      this.currentBackground = init.currentBackground;
      this.updateBackgroundUrls(init);
      this.emitChange();
    }
  },

  updateBackground: function (route) {
    this.currentBackground = route.get('background');
    this.emitChange();
  },

  updateBackgroundUrls: function (payload) {
    payload.backgrounds.forEach(function (key) {
      if (key) {
        this.backgroundUrls[key] = buildImageUrl(
          this.imageServiceUrl,
          this.width,
          this.height,
          key
        );
      }
    }, this);
  },

  getImageServiceUrl: function () {
    return this.imageServiceUrl;
  },

  getTop: function () {
    return this.top;
  },

  getHeight: function () {
    return this.height;
  },

  getNotCurrentBackgroundUrls: function () {
    return Object.keys(this.backgroundUrls).filter(function (key) {
      return key !== this.currentBackground;
    }, this).map(function (notCurrent) {
      return this.backgroundUrls[notCurrent];
    }, this);
  },

  getCurrentBackgroundUrl: function () {
    if (this.width && this.height) {
      return this.backgroundUrls[this.currentBackground];
    }
    return null;
  },

  dehydrate: function () {
    return {
      width: this.width,
      height: this.height,
      top: this.top,
      currentBackground: this.currentBackground,
      imageServiceUrl: this.imageServiceUrl,
      backgroundUrls: this.backgroundUrls
    };
  },

  rehydrate: function (state) {
    this.width = state.width;
    this.height = state.height;
    this.top = state.top;
    this.currentBackground = state.currentBackground;
    this.imageServiceUrl = state.imageServiceUrl;
    this.backgroundUrls = state.backgroundUrls;
  }
});

module.exports = BackgroundStore;
