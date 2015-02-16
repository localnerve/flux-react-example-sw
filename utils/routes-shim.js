/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 */
'use strict';

var debug = require('debug')('Example:Utils:Routes');
var service = require('../services/routes');
var toFluxibleRoutes = require('./transformers').toFluxibleRoutes;

/**
 * Get the routes from state, if exists, or get routes from routes service.
 *
 */
function getRoutes(state, done) {  
  if (!state) {
    debug('Server routes request start');

    // Use the routes service without fluxible and transform to fluxible
    service.read(null, 'routes', {}, {}, function(err, routes) {
      debug('Server routes request complete');
      done(err, routes && toFluxibleRoutes(routes));
    });
  } else {
    debug('Getting routes from state');

    var err;
    if (!state.routes) {
      err = new Error('routes member was missing from dehydrated state');
    }

    done(err, state.routes);
  }  
}

module.exports = getRoutes;