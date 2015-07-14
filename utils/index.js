/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var FluxibleRouteTransformer = require('./FluxibleRouteTransformer');
var buildImageUrl = require('./imageServiceUrls');
var codes = require('./codes');

function createFluxibleRouteTransformer (options) {
  options = options || {};
  return new FluxibleRouteTransformer(options.actions);
}

module.exports = {
  createFluxibleRouteTransformer: createFluxibleRouteTransformer,
  buildImageUrl: buildImageUrl,
  conformErrorStatus: codes.conformErrorStatus
};
