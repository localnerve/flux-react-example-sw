/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
 
 // routes will dramatically change:
 // routes will come down with state in the initial load
 // routes will be sourced from a cms service and pulled from redis backed config
 // 
var example = require('../../actions/example');

module.exports = {
  home: {
    path: '/',
    method: 'get',
    page: 'home',
    label: 'Home',
    action: function (context, payload, done) {
      var params = {
        resource: 'docs',
        key: '/docs/home.md',
        pageTitle: 'Flux React Example | An Example Isomorphic Application'
      };
      
      context.executeAction(example, params, done);
    }
  }
};
