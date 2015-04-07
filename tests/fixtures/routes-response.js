/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

module.exports = {
  home: {
    path: '/',
    method: 'get',
    page: 'home',
    label: 'Home',
    component: 'SinglePage',
    mainNav: true,
    order: 0,
    priority: 1,
    action: {
      name: 'page',
      params: {
        resource: 'home',
        url: 'https://api.github.com/repos/localnerve/flux-react-example-data/contents/pages/home.md',
        format: 'markdown',
        prefetch: 'server',
        pageTitle: 'An Example Isomorphic Application'
      }
    }
  }
};