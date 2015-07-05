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
    'INIT_IMAGE_SERVICE': 'setImageService',
    'INIT_BACKGROUNDS': 'updateBackgroundUrls'
  },

  initialize: function () {
    this.width = 0;
    this.height = 0;
    this.top = 0;
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

  setImageService: function (payload) {
    this.imageServiceUrl = payload.serviceUrl;
    this.emitChange();
  },

  updateBackgroundUrls: function (payload) {
    payload.backgrounds.forEach(function (key) {
      this.backgroundUrls[key] = buildImageUrl(
        this.imageServiceUrl,
        this.width,
        this.height,
        key
      );
    }, this);
  },

  getImageServiceUrl: function () {
    return this.imageServiceUrl;
  },

  getTop: function () {
    return this.top;
  },

  getBackgroundUrl: function (key) {
    return this.backgroundUrls[key];
  },

  getBackgroundUrls: function () {
    return Object.keys(this.backgroundUrls).map(function (key) {
      return this.backgroundUrls[key];
    });
  },

  dehydrate: function () {
    return {
      width: this.width,
      height: this.height,
      top: this.top,
      imageServiceUrl: this.imageServiceUrl,
      backgroundUrls: this.backgroundUrls
    };
  },

  rehydrate: function (state) {
    this.width = state.width;
    this.height = state.height;
    this.top = state.top;
    this.imageServiceUrl = state.imageServiceUrl;
    this.backgroundUrls = state.backgroundUrls;
  }
});

module.exports = BackgroundStore;
