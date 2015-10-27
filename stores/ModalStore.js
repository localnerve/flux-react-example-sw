/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var createStore = require('fluxible/addons').createStore;

var ModalStore = createStore({
  storeName: 'ModalStore',

  handlers: {
    'MODAL_START': 'modalStart',
    'RECEIVE_PAGE_CONTENT': 'updateProps',
    'MODAL_FAILURE': 'modalFailure',
    'MODAL_STOP': 'modalStop'
  },

  /**
   * Set inital store state.
   */
  initialize: function () {
    this.isOpen = false;
    this.component = '';
    this.failure = false;
    this.props = null;
  },

  /**
   * MODAL_START handler.
   * Start a modal dialog.
   *
   * @param {Object} payload - The MODAL_START action payload.
   * @param {Object} [payload.props] - The props for the UI component.
   * @param {String} payload.component- The UI component.
   */
  modalStart: function (payload) {
    this.props = payload.props;
    this.component = payload.component;
    this.isOpen = true;
    this.failure = false;
    this.emitChange();
  },

  /**
   * RECEIVE_PAGE_CONTENT handler.
   * Updates the props for a modal dialog.
   *
   * @param {Object} payload - The RECEIVE_PAGE_CONTENT action payload.
   * @param {Object} payload.data - The props for the UI component.
   */
  updateProps: function (payload) {
    this.props = payload.data;
    this.emitChange();
  },

  /**
   * MODAL_STOP handler.
   * Stop a modal dialog.
   */
  modalStop: function () {
    this.isOpen = false;
    this.component = '';
    this.props = null;
    this.failure = false;
    this.emitChange();
  },

  /**
   * MODAL_FAILURE handler.
   */
  modalFailure: function (payload) {
    this.props = payload;
    this.failure = true;
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
   * @returns {Boolean} The failure boolean.
   */
  getFailure: function () {
    return this.failure;
  },

  /**
   * @returns {Object} The ModalStore state.
   */
  dehydrate: function () {
    return {
      component: this.component,
      props: this.props,
      isOpen: this.isOpen,
      failure: this.failure
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
    this.failure = state.failure;
  }
});

module.exports = ModalStore;
