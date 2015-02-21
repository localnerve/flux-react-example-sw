/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Routes');
var jsonToFluxible = require('../utils/transformers').jsonToFluxible;

function routes(context, payload, done) {
  var transformer = (typeof payload.transform === 'function' ? 
        payload.transform: jsonToFluxible);

  if (payload.routes) {
    var fluxibleRoutes = payload.routes;

    if (payload.transform) {
      debug('transforming routes');

      fluxibleRoutes = transformer(payload.routes);
    }

    context.dispatch('RECEIVE_ROUTES', fluxibleRoutes);
    return done();
  }

  debug('Routes request start');
  context.service.read(payload.resource, payload, {}, function(err, routes) {
    debug('Routes request complete');
    
    if (err) {
      return done(err);
    }
    
    var fluxibleRoutes = transformer(routes);
    context.dispatch('RECEIVE_ROUTES', fluxibleRoutes);
    done(null, fluxibleRoutes);
  });
}

module.exports = routes;