/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Extend fluxible to bootstrap routes on the client and server.
 * At this time, fluxible is not supporting dynamic routes itself.
 *
 */
'use strict';

var debug = require('debug')('Example:FluxibleExtension');
var service = require('../services/routes');

// This will be a hash of all the availble actions that can be defined
var actions = {
  example: require('../actions/example')
};

// Transforms from a json model to fluxible routes
function jsonToFluxible(routes) {
  debug('Transform collection to fluxible routes');
  var fluxibleRoutes = {};

  Object.keys(routes).forEach(function(route) {
    var transformed = routes[route];

    transformed.action = (function(action, actionParams) {
      return function (context, payload, done) {
        context.executeAction(action, actionParams, done);
      };
    }(actions[transformed.action.name], transformed.action.params));

    fluxibleRoutes[route] = transformed;
  });

  return fluxibleRoutes;
}

// Call to the routes service and transform
function getRoutes(state, done) {  
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

// Extend fluxible to support dynamic routes.
// After updateRoutes, you will have to execute a routesAction
// to update the ApplicationStore.
// The only time you don't have to do this is on the initial client load,
// because its already been sent down in the context state.
function extend(app, routrPlugin) {
  debug('Fluxible app extended');

  app.updateRoutes = function updateRoutes(state, done) {
    debug('Updating Routes');

    // This is bad, but no way to update RoutrPlugin
    var routerIndex;
    for (var i = 0; i < app._plugins.length; i++) {
      if (app._plugins[i].name === 'RoutrPlugin') {
        routerIndex = i;
        break;
      }
    }
    if (routerIndex) {
      app._plugins.splice(routerIndex, 1);
    }

    getRoutes(state, function(err, routes) {
      if (!err) {
        debug('Adding Routr Plugin');    
        app.plug(routrPlugin({ routes: routes }));
      }
      done && done(err, routes);
    });
  };
}

module.exports = extend;