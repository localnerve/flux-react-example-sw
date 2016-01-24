/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Handle robots request.
 * Dynamically create allowed urls from mainNav routes.
 * Reads a robots.txt template and replaces SITEMAPURL and ALLOWURLS.
 *
 * Reminder: There is a compression minimum threshold below which no compression
 *   occurs.
 */
/* global Promise */
'use strict';

var debug = require('debug')('robots');
var fs = require('fs');
var urlLib = require('url');

var baseDir = '..';

var serviceData = require(baseDir + '/services/data');
var config = require(baseDir + '/configs').create({
  baseDir: baseDir
});
var settings = config.settings;
var utils = require('./utils');

/**
 * Handle requests for robots.txt.
 *
 * @param {Object} req - The request object, not used.
 * @param {Object} res - The response object.
 * @param {Object} next - The next object.
 */
function robots (req, res, next) {
  debug('Read routes and robots template ', settings.dist.robotsTemplate);

  Promise.all([
    utils.nodeCall(serviceData.fetch, {
      resource: config.data.FRED.mainResource
    }),

    utils.nodeCall(fs.readFile, settings.dist.robotsTemplate, {
      encoding: 'utf8'
    })
  ])
  .then(function (results) {
    var robotsContent,
        robotsTemplate = results[1],
        routes = results[0].content;

    debug('Got template', robotsTemplate);

    robotsContent = robotsTemplate
      .replace(/(SITEMAPURL)/i, function () {
        var ssl = settings.web.sslRemote || settings.web.ssl;

        return urlLib.format({
          protocol: ssl ? 'https' : 'http',
          hostname: settings.web.appHostname,
          pathname: settings.web.sitemap
        });
      })
      .replace(/(ALLOWURLS)/i, function () {
        return Object.keys(routes)
          .filter(function (key) {
            return routes[key].mainNav;
          })
          .map(function (key) {
            return 'Allow: ' + routes[key].path;
          })
          .join('\n');
      });

    res.header('Content-Type', 'text/plain');
    res.send(robotsContent);
  })
  .catch(function (err) {
    debug('Request failed: ', err);
    err.status = err.statusCode = (err.statusCode || err.status || 500);
    next(err);
  });
}

module.exports = robots;
