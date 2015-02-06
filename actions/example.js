/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Example');

module.exports = function (context, payload, done) {
  debug('Example action dispatching UPDATE_PAGE_TITLE');

  context.dispatch('UPDATE_PAGE_TITLE', {
    pageTitle: (payload.pageTitle) + ' | Example'
  });
  
  return done();
};
