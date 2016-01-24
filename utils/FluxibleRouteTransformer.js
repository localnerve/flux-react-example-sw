/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Example:Utils:FluxibleRouteTransformer');

/**
 * Creates a new FluxibleRouteTransformer.
 * @class
 * @param {Object} actions - The actions available for use in transforms.
 */
function FluxibleRouteTransformer (actions) {
  this.actions = actions;
  this.jsonToFluxible = this.jsonToFluxible.bind(this);
}

/**
 * Transform from json routes to fluxible routes.
 * Matches actions in given json to actions injected at this object's creation.
 * Converts static action definitions to dynamic action executors.
 *
 * @param {Object} jsonRoutes - Routes in JSON format.
 * @returns {Object} Routes with executable actions (functions), or 'fluxible routes'.
 */
FluxibleRouteTransformer.prototype.jsonToFluxible = function jsonToFluxible (jsonRoutes) {
  debug('Transforming json to fluxible routes');
  // debug('Instance', require('util').inspect(this));

  var fluxibleRoutes = {};

  /**
   * Make an executable action
   *
   * @param {Function} action - The action to execute.
   * @param {Object} params - The params for that action.
   * @returns {Function} a dynamic action executor.
   */
  var makeAction = function (action, params) {
    // #42, support multiple concurrent actions
    var copyParams = JSON.parse(JSON.stringify(params));

    /**
     * The dynamic action executor.
     * The supplied payload is ignored in favor of the enclosed copyParams.
     * If executed with a promise, as is true with the Fluxible action context,
     *  all you need is the action reference from the routes.
     *
     * @param {Object} context - The fluxible action context.
     * @param {Object} payload - The action payload.
     * @param {Function} done - The callback to execute on completion.
     */
    return function dynAction (context, payload, done) {
      return context.executeAction(action, copyParams, done);
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

/**
 * Transform from fluxible routes to json routes.
 * Converts the dynamic actions back to static definitions.
 *
 * @param {Object} fluxibleRoutes - Routes with executable actions, output from #jsonToFluxible.
 * @returns {Object} Routes with their original JSON actions.
 */
FluxibleRouteTransformer.prototype.fluxibleToJson = function fluxibleToJson (fluxibleRoutes) {
  debug('Transforming fluxible to json routes');
  var jsonRoutes = {};

  var getActionParams = {
    /**
     * Retrieve action name and params from executable action.
     *
     * @param {Function} action - The executable action.
     * @param {Object} params - The action parameters.
     * @param {Function} done - The callback to execute on completion.
     */
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
