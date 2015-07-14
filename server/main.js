/**
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

function renderApp (res, context, app, props) {
  var state;

  props.mainScript = settings.web.assets.mainScript();
  props.images = settings.web.images;
  props.trackingSnippet = config.analytics.snippet;

  debug('Creating app state');
  state = app.dehydrate(context);
  state.analytics = config.analytics.globalRef;
  props.state = 'window.App=' + serialize(state) + ';';

  debug('Rendering app component into html');
  props.markup = React.renderToString(context.createElement());
  props.context = context.getComponentContext();

  res.send('<!DOCTYPE html>' +
    React.renderToStaticMarkup(HtmlComponent(props))
  );
}

/**
 * The main bootstrapping route of the application
 */
function bootstrap (app) {
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
    }, function navigateFailure (reason) {
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
      renderApp(res, context, app, renderProps);
    })
    .catch(function (err) {
      debug('bootstrap main route failed');
      next(err);
    });
  };
}

module.exports = bootstrap;
