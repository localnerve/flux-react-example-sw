/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Store for service settings.
 */
'use strict';
var createStore = require('fluxible/addons').createStore;

var SettingsStore = createStore({
  storeName: 'SettingsStore',

  handlers: {
    'SETTINGS_STATE': 'updateSettingsState'
  },

  /**
   * Set inital store state.
   */
  initialize: function () {
    this.hasServiceWorker = false;
    this.hasPushMessaging = false;
    this.hasPermissions = false;
    this.hasNotifications = false;
    this.pushBlocked = false;
    this.syncBlocked = false;
    this.pushSubscription = null;
    this.pushTopics = null;
  },

  /**
   * SETTINGS_STATE handler.
   *
   * @param {Object} payload - The PUSH_NOTIFICATION_STATE action payload.
   * @param {Boolean} [payload.hasServiceWorker] -
   * @param {Boolean} [payload.hasPushMessaging] -
   * @param {Boolean} [payload.hasPermissions] -
   * @param {Boolean} [payload.hasNotifications] -
   * @param {Boolean} [payload.pushBlocked] -
   * @param {Boolean} [payload.syncBlocked] -
   * @param {Object} [payload.pushSubscription] -
   * @param {Array} [payload.pushTopics] -
   */
  updateSettingsState: function (payload) {
    this.hasServiceWorker =
      ('hasServiceWorker' in payload) ? payload.hasServiceWorker : this.hasServiceWorker;
    this.hasPushMessaging =
      ('hasPushMessaging' in payload) ? payload.hasPushMessaging : this.hasPushMessaging;
    this.hasPermissions =
      ('hasPermissions' in payload) ? payload.hasPermissions : this.hasPermissions;
    this.hasNotifications =
      ('hasNotifications' in payload) ? payload.hasNotifications : this.hasNotifications;
    this.pushBlocked =
      ('pushBlocked' in payload) ? payload.pushBlocked : this.pushBlocked;
    this.syncBlocked =
      ('syncBlocked' in payload) ? payload.syncBlocked : this.syncBlocked;
    this.pushSubscription =
      ('pushSubscription' in payload) ? payload.pushSubscription : this.pushSubscription;
    this.pushTopics =
      ('pushTopics' in payload) ? payload.pushTopics : this.pushTopics;
    this.emitChange();
  },

  /**
   * @returns {Boolean} true if the environment supports service worker.
   */
  getHasServiceWorker: function () {
    return this.hasServiceWorker;
  },

  /**
   * @returns {Boolean} true if the environment supports push messaging.
   */
  getHasPushMessaging: function () {
    return this.hasPushMessaging;
  },

  /**
   * @returns {Boolean} true if the environment supports permissions API.
   */
  getHasPermissions: function () {
    return this.hasPermissions;
  },

  /**
   * @returns {Boolean} true if the environment supports notifications API.
   */
  getHasNotifications: function () {
    return this.hasNotifications;
  },

  /**
   * @returns {Boolean} true if the user blocked push notifications.
   */
  getPushBlocked: function () {
    return this.pushBlocked;
  },

  /**
   * @returns {Boolean} true if the user blocked background sync.
   */
  getSyncBlocked: function () {
    return this.syncBlocked;
  },

  /**
   * @returns {Object} the push subscription object.
   */
  getPushSubscription: function () {
    return this.pushSubscription;
  },

  /**
   * @returns {Array} the push notification topics.
   */
  getPushTopics: function () {
    return this.pushTopics;
  },

  /**
   * @returns {Object} The SettingsStore state.
   */
  dehydrate: function () {
    return {
      hasServiceWorker: this.hasServiceWorker,
      hasPushMessaging: this.hasPushMessaging,
      hasPermissions: this.hasPermissions,
      hasNotifications: this.hasNotifications,
      pushBlocked: this.pushBlocked,
      syncBlocked: this.syncBlocked,
      pushSubscription: this.pushSubscription,
      pushTopics: this.pushTopics
    };
  },

  /**
   * Hydrate the SettingsStore from the given state.
   *
   * @param {Object} state - The new SettingsStore state.
   */
  rehydrate: function (state) {
    this.hasServiceWorker = state.hasServiceWorker;
    this.hasPushMessaging = state.hasPushMessaging;
    this.hasPermissions = state.hasPermissions;
    this.hasNotifications = state.hasNotifications;
    this.pushBlocked = state.pushBlocked;
    this.syncBlocked = state.syncBlocked;
    this.pushSubscription = state.pushSubscription;
    this.pushTopics = state.pushTopics;
  }
});

module.exports = SettingsStore;
