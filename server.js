/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */

// some environments run the app from a different directory
process.chdir(__dirname);

require('node-jsx').install({ extension: '.jsx' });

var path = require('path');
var fs = require('fs');
var express = require('express');
var favicon = require('serve-favicon');
var compress = require('compression');
var logger = require('morgan');
var serialize = require('serialize-javascript');
var navigateAction = require('flux-router-component').navigateAction;
var debug = require('debug')('Example');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var React = require('react');
var app = require('./app');
var HtmlComponent = React.createFactory(require('./components/Html.jsx'));

var config = require('./config').create();
var settings = config.get('settings');
// var tracker = config.get('analytics:globalRef');

var server = express();
server.set('state namespace', 'App');
server.use(favicon(path.join(__dirname, settings.dist.favicon)));
server.use(logger(settings.loggerFormat));
server.use(compress());
server.use(settings.web.baseDir, express.static(
  path.join(__dirname, settings.dist.baseDir), { maxAge: settings.web.assetAge }
));
server.use(cookieParser({ httpOnly: true, secure: settings.web.ssl }));
server.use(bodyParser.json());
server.use(csrf({cookie: true}));

// Access fetchr plugin instance, register services, and setup middleware
var fetchrPlugin = app.getPlugin('FetchrPlugin');
// fetchrPlugin.registerService(require('./services/docs'));
// fetchrPlugin.registerService(require('./services/api'));
server.use(fetchrPlugin.getXhrPath(), fetchrPlugin.getMiddleware());

// Every other request gets the app bootstrap
server.use(function (req, res, next) {
  var context = app.createContext({
    req: req, // The fetchr plugin depends on this
    xhrContext: {
      _csrf: req.csrfToken() // Make sure all XHR requests have the CSRF token
    }
  });

  debug('Executing navigate action');
  context.executeAction(navigateAction, {
    url: req.url
  }, function (err) {
    if (err) {
      if (err.status && err.status === 404) {
        next();
      } else {
        next(err);
      }
      return;
    }

    debug('Exposing context state');
    var exposed = 'window.App=' + serialize(app.dehydrate(context)) + ';';

    debug('Rendering Application component into html');
    var AppComponent = app.getAppComponent();
    var doctype = '<!DOCTYPE html>';
    React.withContext(context.getComponentContext(), function () {
      var html = React.renderToStaticMarkup(HtmlComponent({
        assets: settings.src.assets(),
        trackingSnippet: config.get('analytics:snippet'),
        scriptsDir: settings.web.scripts,
        styles: fs.readFileSync(settings.dist.css, { encoding: 'utf8' }),
        state: exposed,
        markup: React.renderToString(AppComponent({
            context: context.getComponentContext()
        }))
      }));
      res.send(doctype + html);
    });
  });
});

var port = process.env.PORT || 3000;
server.listen(port);
console.log('Listening on port ' + port);