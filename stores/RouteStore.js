/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var FluxibleRouteStore = require('fluxible-router').RouteStore;
var inherits = require('inherits');
var transformer = require('../utils').createFluxibleRouteTransformer({
  actions: require('../actions/interface')
});

function RouteStore () {
  FluxibleRouteStore.apply(this, arguments);
}

inherits(RouteStore, FluxibleRouteStore);

RouteStore.storeName = FluxibleRouteStore.storeName;
RouteStore.handlers = FluxibleRouteStore.handlers;

RouteStore.prototype.dehydrate = function dehydrate () {
  var state = FluxibleRouteStore.prototype.dehydrate.apply(this, arguments);
  state.routes = transformer.fluxibleToJson(state.routes);
  return state;
};

RouteStore.prototype.rehydrate = function rehydrate (state) {
  state.routes = transformer.jsonToFluxible(state.routes);
  return FluxibleRouteStore.prototype.rehydrate.apply(this, arguments);
};

module.exports = RouteStore;
