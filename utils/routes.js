/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Bootstrap routes on the client and server outside of flux.
 * At this time, fluxible is not supporting dynamic routes itself.
 *
 * This is a WIP solution.
 */
'use strict';

var debug = require('debug')('Example:RoutesUtil');
var service = require('../services/routes');

// This will be a hash of all the availble actions that can be defined
var actions = {
  example: require('../actions/example')
};

// Transforms from a json model to fluxible routes
function jsonToFluxible(routes) {
  debug('Transform collection to fluxible routes');
  var pages = {};

  Object.keys(routes).forEach(function(route) {
    var page = routes[route];

    page.action = (function(action, actionParams) {
      return function (context, payload, done) {
        context.executeAction(action, actionParams, done);
      };
    }(actions[page.action.name], page.action.params));

    pages[route] = page;
  });

  return pages;
}

function routes(state, done) {  
  if (!state) {
    debug('Server routes request start');

    service.read(null, 'routes', {}, {}, function(err, routes) {
      debug('Server routes request complete');
      done(err, routes && jsonToFluxible(routes));
    });
  } else {
    done(null, state.routes);
  }  
}

module.exports = routes;