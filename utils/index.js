/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var FluxibleRouteTransformer = require('./FluxibleRouteTransformer');
var buildImageUrl = require('./imageServiceUrls');
var codes = require('./codes');

/**
 * Factory to create a FluxibleRouteTransformer object.
 *
 * @param {Object} options - Options to control the object creation.
 * @param {Object} options.actions - The actions available for use in route transformations, and thus in the backend.
 */
function createFluxibleRouteTransformer (options) {
  options = options || {};
  return new FluxibleRouteTransformer(options.actions);
}

module.exports = {
  createFluxibleRouteTransformer: createFluxibleRouteTransformer,
  buildImageUrl: buildImageUrl,
  conformErrorStatus: codes.conformErrorStatus
};
