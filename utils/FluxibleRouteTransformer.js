/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Example:Utils:FluxibleRouteTransformer');

function FluxibleRouteTransformer (actions) {
  this.actions = actions;
  this.jsonToFluxible = this.jsonToFluxible.bind(this);
}

/*
 * Transform from json routes to fluxible routes.
 * Matches actions in given json to actions injected at creation.
 * Converts static action definitions to dynamic action executors.
 */
FluxibleRouteTransformer.prototype.jsonToFluxible = function (jsonRoutes) {
  debug('Transforming json to fluxible routes');
  debug('Instance', require('util').inspect(this));

  var fluxibleRoutes = {};

  var makeAction = function (action, params) {
    // #42, support multiple concurrent actions
    var copyParams = JSON.parse(JSON.stringify(params));

    return function dynAction (context, payload, done) {
      context.executeAction(action, copyParams, done);
    };
  };

  Object.keys(jsonRoutes).forEach(function (route) {
    var dest = {}, src = jsonRoutes[route];

    if (!this.actions[src.action.name]) {
      throw new Error('action "'+src.action.name+'" not found');
    }

    debug('transforming "'+src.action.name+'" to '+
      (this.actions[src.action.name].name || 'undefined'));

    Object.keys(src).forEach(function (key) {
      if (key === 'action') {
        dest.action = makeAction(
          this.actions[src.action.name], src.action.params
        );
      } else {
        dest[key] = src[key];
      }
    }, this);

    fluxibleRoutes[route] = dest;
  }, this);

  return fluxibleRoutes;
};

/*
 * Transform from fluxible routes to json routes.
 * Converts the dynamic actions back to static definitions.
 */
FluxibleRouteTransformer.prototype.fluxibleToJson = function (fluxibleRoutes) {
  debug('Transforming fluxible to json routes');
  var jsonRoutes = {};

  var getActionParams = {
    executeAction: function (action, params, done) {
      done({
        name: action.name,
        params: params
      });
    }
  };

  Object.keys(fluxibleRoutes).forEach(function (route) {
    var dest = {}, src = fluxibleRoutes[route];

    Object.keys(src).forEach(function (key) {
      if (key === 'action') {
        src.action(getActionParams, {}, function (action) {
          dest.action = action;
        });
      } else {
        dest[key] = src[key];
      }
    });

    debug('transformed action '+dest.action.name);

    jsonRoutes[route] = dest;
  });

  return jsonRoutes;
};

module.exports = FluxibleRouteTransformer;
