/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
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
    action: function (context, payload, done) {
      context.executeAction(action, params, done);
    }
  }
};
