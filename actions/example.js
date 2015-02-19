/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var defaultPageTitle = 'Default Page Title';

function example(context, payload, done) {
  context.dispatch('UPDATE_PAGE_TITLE', {
    pageTitle: (payload.pageTitle || defaultPageTitle)
  });
  
  return done();
}

module.exports = example;
