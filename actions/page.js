/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

// var ApplicationStore = require('../stores/ApplicationStore');
var debug = require('debug')('Example:PageAction');
var defaultPageTitle = 'Default Page Title';

function page(context, payload, done) {
  debug('page action payload\n');
  debug(require('util').inspect(payload, {depth:null}));

  // var contents = context.getStore(ApplicationStore).getContents();
  // debug('ApplicationStore contents\n');
  // debug(require('util').inspect(contents, {depth:null}));

  debug('Page request start');
  context.service.read('page', payload, {}, function(err, data) {
    debug('Page request complete');

    if (err) {
      return done(err);
    }

    if (!data) {
      var noData = new Error('Page not found');
      noData.statusCode = 404;
      return done(noData);
    }


    context.dispatch('UPDATE_PAGE', {
      title: (payload.pageTitle || defaultPageTitle),
      content: data
    });

    return done();
  });  
}

module.exports = page;