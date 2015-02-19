/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * TODO: polyfill function.name for IE
 */
'use strict';

var debug = require('debug')('Example:Utils:Transformers');

// This will be a hash of all the availble actions that can be defined
var actions = {
  example: require('../actions/example')
};

/*
 * Transform from json routes to fluxible routes.
 */
function jsonToFluxible(jsonRoutes) {
  debug('Transforming json to fluxible routes');
  var fluxibleRoutes = {};

  var makeAction = function(action, params) {
    return function (context, payload, done) {
      context.executeAction(action, params, done);
    };    
  };

  Object.keys(jsonRoutes).forEach(function(route) {
    var dest = {}, src = jsonRoutes[route];

    if (!actions[src.action.name]) {
      throw new Error('action "'+src.action.name+'"" not found');
    }

    debug('transforming "'+src.action.name+'" to '+
      (actions[src.action.name].name || 'undefined'));

    Object.keys(src).forEach(function(key) {
      if (key === 'action') {
        dest.action = makeAction(actions[src.action.name], src.action.params);
      } else {
        dest[key] = src[key];
      }
    });

    fluxibleRoutes[route] = dest;
  });

  return fluxibleRoutes;
}

/*
 * Transform from fluxible routes to json routes.
 */
function fluxibleToJson(fluxibleRoutes) {
  debug('Transforming fluxible to json routes');
  var jsonRoutes = {};

  var getActionParams = {
    executeAction: function(action, params, done) {
      done({
        name: action.name,
        params: params
      });
    }
  };

  Object.keys(fluxibleRoutes).forEach(function(route) {
    var dest = {}, src = fluxibleRoutes[route];

    Object.keys(src).forEach(function(key) {
      if (key === 'action') {
        src.action(getActionParams, {}, function(action) {
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
}

module.exports = {
  jsonToFluxible: jsonToFluxible,
  fluxibleToJson: fluxibleToJson
};