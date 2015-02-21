/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('RoutrPlugin');
var Router = require('routr');

var passThru = function(routes) { return routes; };

module.exports = function routrPlugin(options) {
    options = options || {};

    var staticRoutes = options.routes;
    var storeName = options.storeName;
    var eventName = options.eventName;
    var dehydrateRoutes = options.dehydrateRoutes || passThru;
    var rehydrateRoutes = options.rehydrateRoutes || passThru;

    var routes = staticRoutes;

    /**
     * @class RoutrPlugin
     */
    return {
        name: 'RoutrPlugin',
        /**
         * Called to plug the FluxContext
         * @method plugContext
         * @returns {Object}
         */
        plugContext: function plugContext(options) {
            var actionContext, componentContext, router;

            if (staticRoutes) {
                router = new Router(staticRoutes);
            }

            /**
             * Dynamically update the routes.
             * @param {Object} params
             * @param {Object} params.routes The new routes to supply Routr
             */
            var updateRoutes = function updateRoutes(params) {
                debug('updating routes');
                routes = params.routes;
                router = new Router(routes);
                if (actionContext) {
                    actionContext.router = router;
                }
                if (componentContext) {
                    componentContext.makePath = router.makePath.bind(router);
                }
            };

            var pluginContext = {
                /**
                 * Provides full access to the router in the action context
                 * @param {Object} actionContext
                 */
                plugActionContext: function plugActionContext(context) {
                    actionContext = context;
                    actionContext.router = router;
          
                    if (!staticRoutes) {
                        // Allow private event for now, check flux compliance
                        actionContext.getStore(storeName)
                            .removeListener(eventName, updateRoutes)
                            .on(eventName, updateRoutes);
                    }
                },
                /**
                 * Provides access to create paths by name
                 * @param {Object} componentContext
                 */
                plugComponentContext: function plugComponentContext(context) {
                    componentContext = context;
                    componentContext.makePath = router.makePath.bind(router);
                }
            };
      
            if (!staticRoutes) {
                // Allows context plugin settings to be persisted between server and client.
                // Called on server to send data down to the client
                pluginContext.dehydrate = function () {
                  return { routes: dehydrateRoutes(routes) };
                };

                // Called on client to rehydrate the context plugin settings
                pluginContext.rehydrate = function (state) {
                  updateRoutes({ routes: rehydrateRoutes(state.routes) });
                };
            }

            return pluginContext;
        },
        /**
         * @method getRoutes
         * @returns {Object}
         */
        getRoutes: function getRoutes() {
            return routes;
        }
    };
};
