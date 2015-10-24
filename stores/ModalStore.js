/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var createStore = require('fluxible/addons').createStore;

var ModalStore = createStore({
  storeName: 'ModalStore',

  handlers: {
    'START_MODAL': 'startModal',
    'STOP_MODAL': 'stopModal'
  },

  /**
   * Set inital store state.
   */
  initialize: function () {
    this.isOpen = false;
    this.component = '';
    this.props = {};
  },

  /**
   * START_MODAL handler.
   * Start a modal dialog.
   *
   * @param {Object} payload - The START_MODAL action payload.
   * @param {Object} payload.props - The props for the UI component.
   * @param {String} payload.component- The UI component.
   */
  startModal: function (payload) {
    this.props = payload.props;
    this.component = payload.component;
    this.isOpen = true;
    this.emitChange();
  },

  /**
   * STOP_MODAL handler.
   * Stop a modal dialog.
   */
  stopModal: function () {
    this.isOpen = false;
    this.emitChange();
  },

  /**
   * @returns {String} The name of the modal UI component.
   */
  getComponent: function () {
    return this.component;
  },

  /**
   * @returns {Boolean} The isOpen boolean.
   */
  getIsOpen: function () {
    return this.isOpen;
  },

  /**
   * @returns {Object} The modal UI component props.
   */
  getProps: function () {
    return this.props;
  },

  /**
   * @returns {Object} The ModalStore state.
   */
  dehydrate: function () {
    return {
      component: this.component,
      props: this.props,
      isOpen: this.isOpen
    };
  },

  /**
   * Hydrate the ModalStore from the given state.
   *
   * @param {Object} state - The new ModalStore state.
   */
  rehydrate: function (state) {
    this.component = state.component;
    this.props = state.props;
    this.isOpen = state.isOpen;
  }
});

module.exports = ModalStore;
