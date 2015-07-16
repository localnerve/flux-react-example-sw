/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * NOTE: Only used in transformer tests.
 * Used in transformer tests = Can't use transformer to generate from fixture.
 *
 * Could partially generate from backend, but must supply action closures manually.
 */
'use strict';

var actions = require('../../actions/interface');

var params = {
  resource: 'test',
  key: '/path/to/test',
  pageTitle: 'A Test Title'
};

var action = actions.page;

module.exports = {
  home: {
    path: '/',
    method: 'get',
    page: 'home',
    label: 'Home',
    component: 'SinglePage',
    order: 0,
    priority: 1,
    background: '3',
    mainNav: true,
    action: function (context, payload, done) {
      context.executeAction(action, params, done);
    }
  },
  about: {
    path: '/about',
    method: 'get',
    page: 'about',
    label: 'About',
    component: 'SinglePage',
    mainNav: true,
    background: '4',
    order: 1,
    priority: 1,
    action: function (context, payload, done) {
      context.executeAction(action, params, done);
    }
  },
  contact: {
    path: '/contact',
    method: 'get',
    page: 'contact',
    label: 'Contact',
    component: 'Contact',
    mainNav: true,
    background: '5',
    order: 2,
    priority: 1,
    action: function (context, payload, done) {
      context.executeAction(action, params, done);
    }
  }
};
