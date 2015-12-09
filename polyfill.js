/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Apply all global client-side polyfills.
 */
/* global Promise, Object */
'use strict';

if (!Promise) {
  require('es6-promise').polyfill();
}

if (!Object.assign) {
  Object.defineProperty(Object, 'assign', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: require('object-assign')
  });
}
