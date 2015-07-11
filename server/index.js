/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
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

var data = require(baseDir + '/services/data');

var settings = config.settings;
var protocol = require(settings.web.ssl ? 'https' : 'http');

var rewriteRules = [
  // rewrite root image requests to settings.web.images
  '^/([^\\/]+\\.(?:png|jpg|jpeg|webp|ico|svg|gif)(?:\\?.*)?$) ' +
    settings.web.images + '/$1 [NC L]'
];

var app = express();
var server = protocol.createServer(app);

app.use(favicon(settings.dist.favicon));
app.use(logger(settings.loggerFormat));
app.use(compress());
app.use(errorHandler.maintenance());
app.use(rewrite(rewriteRules));
app.use(settings.web.baseDir, express.static(
  settings.dist.baseDir, { maxAge: settings.web.assetAge }
));
app.use(cookieParser({ httpOnly: true, secure: settings.web.ssl }));
app.use(bodyParser.json());
app.use(csrf({ cookie: true }));

// Access fetchr plugin instance, register services, and setup middleware
var fetchrPlugin = fluxibleApp.getPlugin('FetchrPlugin');
fetchrPlugin.registerService(require(baseDir + '/services/routes'));
fetchrPlugin.registerService(require(baseDir + '/services/page'));
fetchrPlugin.registerService(require(baseDir + '/services/contact'));
app.use(fetchrPlugin.getXhrPath(), fetchrPlugin.getMiddleware());

// Every other request gets the app bootstrap
app.use(main(fluxibleApp));

app.use(errorHandler({
  server: server,
  static: {
    '404': settings.dist.four04,
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
