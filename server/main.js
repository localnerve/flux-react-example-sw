/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var baseDir = '..';

var debug = require('debug')('Example:Server');
var fs = require('fs');
var Q = require('q');
var serialize = require('serialize-javascript');
var React = require('react');
var navigateAction = require('fluxible-router').navigateAction;

var HtmlComponent = React.createFactory(require(baseDir + '/components/Html.jsx'));
var routesAction = require(baseDir + '/actions/routes');
var initAction = require(baseDir + '/actions/init');
var conformErrorStatus = require(baseDir + '/utils').conformErrorStatus;
var config = require(baseDir + '/configs').create({
  baseDir: baseDir
});
var settings = config.settings;

/**
 * Render the full application with props and send the response.
 *
 * @param {Object} req - The Request object.
 * @param {Object} res - The Response object.
 * @param {Object} context - The fluxible application context.
 * @param {Object} app - The fluxible app.
 * @param {Object} props - The already accumulated props object.
 */
function renderApp (req, res, context, app, props) {
  var state,
      clientSideRenderOnly = req.query.render === '0';

  props.mainScript = settings.web.assets.mainScript();
  props.images = settings.web.images;
  props.trackingSnippet = config.analytics.snippet;
  props.browserConfig = settings.web.browserConfig;
  props.appManifest = settings.web.appManifest;
  props.swRegistrationScript = settings.web.assets.swRegScript();
  props.swMainScript = settings.web.serviceWorker.main;

  debug('Creating app state');
  state = app.dehydrate(context);
  state.analytics = config.analytics.globalRef;
  state.timestamp = Date.now();
  props.state = 'window.App=' + serialize(state) + ';';

  if (clientSideRenderOnly) {
    debug('NOT Rendering app component');
    props.markup = '';
  } else {
    debug('Rendering app component into html');
    props.markup = React.renderToString(context.createElement());
  }

  props.context = context.getComponentContext();

  res.send('<!DOCTYPE html>' +
    React.renderToStaticMarkup(HtmlComponent(props))
  );
}

/**
 * Create the main bootstrapping route of the application.
 *
 * @param {Object} app - The fluxible app.
 * @returns {Function} The main bootstraping application middleware.
 */
function bootstrap (app) {
  /**
   * The main application middleware.
   * Gathers the props and state for the application, renders it,
   *  and sends the response.
   * Triggers 500 response if there is an error gathering the props and creating
   *  the application state.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Object} next - The next object.
   */
  return function main (req, res, next) {
    var context, routes, renderProps = {};

    debug('Creating app context');
    context = app.createContext({
      req: req, // The fetchr plugin depends on this
      xhrContext: {
        _csrf: req.csrfToken() // Make sure all XHR requests have the CSRF token
      }
    });

    debug('Executing routes action');
    context.executeAction(routesAction, {
      resource: config.data.FRED.mainResource
    })
    .then(function (routesResult) {
      routes = routesResult;
      debug('Executing init action');
      return context.executeAction(initAction, {
        backgrounds: {
          serviceUrl: config.images.service.url(),
          serviceOptions: {
            origin: {
              host: settings.web.assetHost,
              ssl: settings.web.ssl,
              path: settings.web.images
            },
            cloudName: config.images.service.cloudName()
          },
          currentBackground: routes[config.data.defaults.pageName].background,
          backgrounds: Object.keys(routes).map(function (route) {
            return routes[route].background;
          })
        },
        page: {
          defaultPageName: config.data.defaults.pageName
        }
      });
    })
    .then(function () {
      debug('Prefetching priority 0 route content');
      var promises = [];
      Object.keys(routes).forEach(function (route) {
        if (routes[route].priority === 0) {
          promises.push(context.executeAction(
            routes[route].action, {}
          ));
        }
      });
      return Q.all(promises);
    })
    .then(function () {
      debug('Executing navigate action');
      return context.executeAction(navigateAction, {
        url: req.url
      });
    })
    .then(function () {
      debug('Navigate succeeded');
      // just move on to next
      var deferred = Q.defer();
      deferred.resolve();
      return deferred.promise;
    }, function (reason) {
      debug('Navigate failure reason: ' +
        require('util').inspect(reason, { depth: null }));
      res.status(reason.statusCode);
      return context.executeAction(
        routes[conformErrorStatus(reason.statusCode)].action, {}
      );
    })
    .then(function () {
      debug('Reading the header styles from ' + settings.dist.css);
      return Q.nfcall(fs.readFile, settings.dist.css, {
        encoding: 'utf8'
      });
    })
    .then(function (headerStyles) {
      debug('Reading the header scripts from ' + settings.dist.headerScript);
      renderProps.headerStyles = headerStyles;
      return Q.nfcall(fs.readFile, settings.dist.headerScript, {
        encoding: 'utf8'
      });
    })
    .then(function (headerScript) {
      debug('Rendering the application');
      renderProps.headerScript = headerScript;
      renderApp(req, res, context, app, renderProps);
    })
    .catch(function (err) {
      debug('bootstrap main route failed');
      err.status = err.statusCode = 500;
      next(err);
    });
  };
}

module.exports = bootstrap;
