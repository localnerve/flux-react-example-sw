/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

function routesAction(context, payload, done) {
  context.dispatch('RECEIVE_ROUTES', payload.routes);
  return done();
}

module.exports = routesAction;