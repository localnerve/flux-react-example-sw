/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Creates an Express application, the middleware stack,
 * registers the app services, initializes the data layer, and binds to a port.
 */
'use strict';

// some environments run the app from a different directory
process.chdir(__dirname);
var baseDir = '..';

require('node-jsx').install({ extension: '.jsx' });

var express = require('express');
var favicon = require('serve-favicon');
var compress = require('compression');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var errorHandler = require('express-error-handler');
var rewrite = require('connect-modrewrite');

var config = require(baseDir + '/configs').create({
  baseDir: baseDir
});
var fluxibleApp = require(baseDir + '/app');
var main = require('./main');
var robots = require('./robots');
var sitemap = require('./sitemap');

var data = require(baseDir + '/services/data');

var settings = config.settings;
var protocol = require(settings.web.ssl ? 'https' : 'http');

var rewriteRules = [
  // rewrite root image requests to settings.web.images
  '^/([^\\/]+\\.(?:png|jpg|jpeg|webp|ico|svg|gif)(?:\\?.*)?$) ' +
    settings.web.images + '/$1 [NC L]',
  // alias home to root
  '^/home/?$ / [L]',
  // forbid 404 and 500 direct requests
  '^/(?:404|500)/?$ [F L]'
];

var app = express();
var server = protocol.createServer(app);

app.use(favicon(settings.dist.favicon));
app.use(logger(settings.loggerFormat));
app.use(compress());
app.use(errorHandler.maintenance());

// Handle special requests
app.use(rewrite(rewriteRules));
// Service worker rewrites delayed so assets.json not required on app start.
app.use(function (req, res, next) {
  var reSourceMap, swRule = new RegExp(
    '^(/' + settings.web.assets.swMainScript(true) + ')$', 'i'
  );

  if (swRule.test(req.url)) {
    req.url = req.url.replace(swRule, settings.web.assets.swMainScript());
  } else {
    reSourceMap = new RegExp(
      '^(/' + settings.web.assets.swMainScriptMap(true) + ')$', 'i'
    );
    if (reSourceMap.test(req.url)) {
      req.url = req.url.replace(reSourceMap, settings.web.assets.swMainScriptMap());
    }
  }
  next();
});

// Serve cached statics
app.use(settings.web.baseDir, express.static(
  settings.dist.baseDir, { maxAge: settings.web.assetAge }
));

// Setup security
app.use(cookieParser({
  httpOnly: true,
  secure: settings.web.ssl || settings.web.sslRemote
}));
app.use(bodyParser.json());
app.use(csrf({ cookie: true }));

// Register services, handle service requests
var fetchrPlugin = fluxibleApp.getPlugin('FetchrPlugin');
fetchrPlugin.registerService(require(baseDir + '/services/routes'));
fetchrPlugin.registerService(require(baseDir + '/services/page'));
fetchrPlugin.registerService(require(baseDir + '/services/contact'));
fetchrPlugin.registerService(require(baseDir + '/services/subscription'));
fetchrPlugin.registerService(require(baseDir + '/services/push'));
app.use(fetchrPlugin.getXhrPath(), fetchrPlugin.getMiddleware());

// Handle robots.txt
app.get(settings.web.robots, robots);

// Handle sitemap.xml
app.get(settings.web.sitemap, sitemap);

// Every other request gets the app bootstrap
app.use(main(fluxibleApp));

// Handle all errors
app.use(errorHandler({
  server: server,
  static: {
    // This 'hard' 500 will cause a restart.
    // Actually covers all 500s except for 503 via errorHandler.
    // The PM in charge should be configured to notify dev on restarts.
    '500': settings.dist.five00,
    // The notice for maintenance mode.
    '503': settings.dist.five03
  }
}));

// Initialize the data layer and start the server.
data.initialize(function (err) {
  if (err) {
    throw err;
  }
  server.listen(config.PORT, function() {
    console.log('Listening on port ' + config.PORT);
  });
});
