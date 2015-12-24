/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Handle sitemap request.
 *
 * Reminder: There is a compression minimum threshold below which no compression
 *   occurs.
 */
'use strict';

var debug = require('debug')('sitemap');
var urlLib = require('url');
var sitemapLib = require('sitemap-xml');

var baseDir = '..';

var serviceData = require(baseDir + '/services/data');
var config = require(baseDir + '/configs').create({
  baseDir: baseDir
});
var settings = config.settings;
var utils = require('./utils');

/**
 * Handle requests for sitemap.xml.
 *
 * @param {Object} req - The request object, not used.
 * @param {Object} res - The response object.
 * @param {Object} next - The next object.
 */
function sitemap (req, res, next) {
  debug('Read routes');

  utils.nodeCall(serviceData.fetch, {
    resource: config.data.FRED.mainResource
  })
  .then(function (result) {
    var routes = result.content,
        ssl = settings.web.ssl || settings.web.sslRemote,
        stream = sitemapLib();

    res.header('Content-Type', 'text/xml');
    stream.pipe(res);

    Object.keys(routes)
      .filter(function (key) {
        return routes[key].mainNav;
      })
      .forEach(function (key) {
        stream.write({
          loc: urlLib.format({
            protocol: ssl ? 'https' : 'http',
            hostname: settings.web.appHostname,
            pathname: routes[key].path
          }),
          priority: routes[key].siteMeta ?
            routes[key].siteMeta.priority : 1.0,
          changefreq: routes[key].siteMeta ?
            routes[key].siteMeta.changefreq : 'monthly'
        });
      });

    stream.end();
  })
  .catch(function (err) {
    debug('Request failed: ', err);
    err.status = err.statusCode = (err.statusCode || err.status || 500);
    next(err);
  });
}

module.exports = sitemap;
