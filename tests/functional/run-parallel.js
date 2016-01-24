/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * A node command line program to run mocha in parallel per browser spec.
 * Relies on global mocha package
 */
'use strict';

var exec = require('child_process').exec;
var Q = require('q');
var browserSpecs = require('./browsers');

var mochaArgs = process.argv[2];
var baseUrl = process.argv[3];

var browsers = Object.keys(browserSpecs);

// context specific log
function log(config, data) {
  config = (config + '          ').slice(0, 10);
  ('' + data).split(/(\r?\n)/g).forEach(function(line) {        
    if (line.replace(/\033\[[0-9;]*m/g,'').trim().length >0) { 
      console.log(config + ': ' + line.trimRight() );
    }
  });
}

// Run a mocha test for a given browser
function runMocha(browser, baseUrl, done) {
  var env = JSON.parse(JSON.stringify(process.env));
  env.TEST_BROWSER = browser;
  env.TEST_BASEURL = baseUrl;

  var mocha = exec('mocha ' + mochaArgs, {
    env: env
  }, done);

  mocha.stdout.on('data', log.bind(null, browser));
  mocha.stderr.on('data', log.bind(null, browser));
}

Q.all(browsers.map(function(browser) {
  return Q.nfcall(runMocha, browser, baseUrl);
})).then(function() {
  console.log('ALL TESTS SUCCESSFUL');
})
.done();