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
    action: {
      name: 'example',
      params: {      
        resource: 'cms',
        key: 'path/to/home',      
        pageTitle: 'Flux React Example | An Example Isomorphic Application'
      }
    }
  }
};