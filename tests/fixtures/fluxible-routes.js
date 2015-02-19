/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var actions = {
  example: require('../../actions/example')
};

var params = {
  resource: 'test',
  key: '/path/to/test',
  pageTitle: 'A Test Title'
};

var action = actions.example;

module.exports = {
  home: {
    path: '/',
    method: 'get',
    page: 'home',
    label: 'Home',
    action: function (context, payload, done) {
      context.executeAction(action, params, done);
    }
  }
};
