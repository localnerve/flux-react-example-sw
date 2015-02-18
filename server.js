/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */

// some environments run the app from a different directory
process.chdir(__dirname);

var debug = require('debug')('Example:Server');

var config = require('./configs').create();
var settings = config.get('settings');

require('node-jsx').install({ extension: '.jsx' });

var protocol = require(settings.web.ssl ? 'https' : 'http');
var path = require('path');
var fs = require('fs');
var express = require('express');
var favicon = require('serve-favicon');
var compress = require('compression');
var logger = require('morgan');
var serialize = require('serialize-javascript');
var navigateAction = require('flux-router-component').navigateAction;
var routesAction = require('./actions/routes');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var errorHandler = require('express-error-handler');
var React = require('react');
var fluxibleApp = require('./app');
var HtmlComponent = React.createFactory(require('./components/Html.jsx'));

var app = express();
var server = protocol.createServer(app);

app.use(favicon(path.join(__dirname, settings.dist.favicon)));
app.use(logger(settings.loggerFormat));
app.use(compress());
app.use(errorHandler.maintenance());
app.use(settings.web.baseDir, express.static(
  path.join(__dirname, settings.dist.baseDir), { maxAge: settings.web.assetAge }
));
app.use(cookieParser({ httpOnly: true, secure: settings.web.ssl }));
app.use(bodyParser.json());
app.use(csrf({ cookie: true }));

// Access fetchr plugin instance, register services, and setup middleware
var fetchrPlugin = fluxibleApp.getPlugin('FetchrPlugin');
fetchrPlugin.registerService(require('./services/routes'));
app.use(fetchrPlugin.getXhrPath(), fetchrPlugin.getMiddleware());

// Every other request gets the app bootstrap
app.use(function main(req, res, next) {
  debug('Fetching app routes');
  fluxibleApp.updateRoutes(undefined, function(err, routes) {
    if (err) {
      return next(err);
    }

    debug('Reading the in-page styles');
    fs.readFile(settings.dist.css, {
      encoding: 'utf8'
    }, function(err, styles) {
      if (err) {
        return next(err);
      }

      debug('Creating app context');
      var context = fluxibleApp.createContext({
        req: req, // The fetchr plugin depends on this
        xhrContext: {
          _csrf: req.csrfToken() // Make sure all XHR requests have the CSRF token
        }
      });

      debug('Executing routes action');
      context.executeAction(routesAction, {
        routes: routes
      }, function(err) {
        if (err) {
          return next(err);
        }

        debug('Executing navigate action');
        context.executeAction(navigateAction, {
          url: req.url
        }, function (err) {
          if (err) {
            return next(err);
          }

          debug('Exposing context state');
          var state = fluxibleApp.dehydrate(context);
          state.routes = routes;
          state.analytics = config.get('analytics:globalRef');
          var exposed = 'window.App=' + serialize(state) + ';';

          debug('Rendering Application component into html');
          var AppComponent = fluxibleApp.getAppComponent();
          var doctype = '<!DOCTYPE html>';
          React.withContext(context.getComponentContext(), function () {
            var html = React.renderToStaticMarkup(HtmlComponent({
              mainScript: settings.web.assets.mainScript(),
              trackingSnippet: config.get('analytics:snippet'),
              headerStyles: styles,
              state: exposed,
              markup: React.renderToString(AppComponent({
                context: context.getComponentContext()              
              }))
            }));
            res.send(doctype + html);
          });
        });
      });
    });
  });
});

app.use(errorHandler({
  server: server,
  static: {
    '404': settings.dist.four04,
    '503': settings.dist.five03
  }
}));

server.listen(config.get('PORT'), function() {
  console.log('Listening on port ' + config.get('PORT'));
});