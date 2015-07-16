/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Fetch main resource and write routes and model fixture files.
 */
 /*jshint multistr: true */
'use strict';

var debug = require('debug')('FixtureGenerator:Routes-Models');
var fs = require('fs');
var fetch = require('../../services/data/fetch');
var cache = require('../../services/data/cache');

var replacement = 'DATA';
var template = '/** This is a generated file **/\n\
  module.exports = JSON.parse(JSON.stringify(\n' + replacement + '\n));';
var output = {
  routesFile: '../fixtures/routes-response.js',
  modelsFile: '../fixtures/models-response.js'
};

// Get main resource - includes routes, models
// Fetch uses the environment to target backend versions (using branches)
// The target environment is set in the calling grunt task
fetch.fetchMain(function (err, routes) {
  if (err) {
    debug('main resource fetch failed');
    throw err;
  }

  // Prepare routes file output
  var fileContents = template.replace(replacement, JSON.stringify(
    routes.content
  ));

  fs.writeFile(output.routesFile, fileContents, function (err) {
    if (err) {
      debug('write of routes response failed');
      throw err;
    }

    debug('successfully wrote routes response file '+ output.routesFile);

    // Prepare models file output - models cached by main resource fetch
    fileContents = template.replace(replacement, JSON.stringify(
      cache.get('models').content
      )
    );

    fs.writeFile(output.modelsFile, fileContents, function (err) {
      if (err) {
        debug('write of models response failed');
        throw err;
      }

      debug('successfully wrote models response file '+ output.modelsFile);
    });
  });
});
