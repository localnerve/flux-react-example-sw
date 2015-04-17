/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var createStore = require('fluxible/addons').createStore;

var ContactStore = createStore({
  storeName: 'ContactStore',  
  handlers: {
    'UPDATE_CONTACT_FIELDS': 'updateContactFields'
  },
  initialize: function () {
    this.name = '';
    this.email = '';
    this.message = '';
  },
  updateContactFields: function (fields) {
    this.name = fields.name || '';
    this.email = fields.email || '';
    this.message = fields.message || '';
    this.emitChange();
  },
  getContactFields: function () {
    return {
      name: this.name,
      email: this.email,
      message: this.message
    };    
  },
  dehydrate: function () {
    return this.getContactFields();
  },
  rehydrate: function (state) {
    this.name = state.name;
    this.email = state.email;
    this.message = state.message;
  }
});

module.exports = ContactStore;