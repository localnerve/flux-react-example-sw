/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 */
'use strict';

var debug = require('debug')('Example:Utils:Transformers');

// This will be a hash of all the availble actions that can be defined
var actions = {
  example: require('../actions/example')
};

/*
 * Transforms from json routes to fluxible routes.
 */
function toFluxibleRoutes(routes) {
  debug('Transforming json to fluxible routes');
  var fluxibleRoutes = {};

  Object.keys(routes).forEach(function(route) {
    var transformed = routes[route];

    debug('transforming "'+transformed.action.name+'" to '+
      (actions[transformed.action.name].name || 'undefined'));

    if (!actions[transformed.action.name]) {
      throw new Error('action "'+transformed.action.name+'"" not found');
    }

    transformed.action = (function(action, actionParams) {
      return function (context, payload, done) {
        context.executeAction(action, actionParams, done);
      };
    }(actions[transformed.action.name], transformed.action.params));

    fluxibleRoutes[route] = transformed;
  });

  return fluxibleRoutes;
}

module.exports = {
  toFluxibleRoutes: toFluxibleRoutes
};