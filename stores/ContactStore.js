/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var createStore = require('fluxible/addons').createStore;

var ContactStore = createStore({
  storeName: 'ContactStore',  
  handlers: {
    'UPDATE_CONTACT_FIELDS': 'updateContactFields',
    'CREATE_CONTACT_SUCCESS': 'clearContactFields',
    'CREATE_CONTACT_FAILURE': 'setContactFailure'
  },
  initialize: function () {
    this.name = '';
    this.email = '';
    this.message = '';
    this.failure = false;
  },
  updateContactFields: function (fields) {
    this.name = fields.name || '';
    this.email = fields.email || '';
    this.message = fields.message || '';
    this.emitChange();
  },
  clearContactFields: function () {
    this.initialize();
    this.emitChange();
  },
  setContactFailure: function () {
    this.failure = true;
    this.emitChange();
  },
  getContactFailure: function () {
    return this.failure;
  },
  getContactFields: function () {
    return {
      name: this.name,
      email: this.email,
      message: this.message
    };    
  },
  dehydrate: function () {
    var state = this.getContactFields();
    state.failure = this.failure;
    return state;
  },
  rehydrate: function (state) {
    this.name = state.name;
    this.email = state.email;
    this.message = state.message;
    this.failure = state.failure;
  }
});

module.exports = ContactStore;