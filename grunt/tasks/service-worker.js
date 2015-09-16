/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Custom service worker tasks and grunt config.
 * Generates service worker scripts.
 * Relies on nconfig task.
 */
 /* global global */
'use strict';

var swPrecache = require('sw-precache');
// var baseDir = '../..';

module.exports = function (grunt) {
  grunt.config('_service_worker', {
    options: {
      cacheId: '<%= pkg.name %>',
      serviceWorkerScript: '<%= project.src.serviceWorker.precache %>',
      directoryIndex: false,
      stripPrefix: '<%= project.dist.baseDir %>',
      replacePrefix: '<%= project.web.baseDir %>',
      staticFileGlobs: [
        '<%= project.dist.fonts %>/**.*',
        '<%= project.dist.images %>/**.*',
        '<%= project.dist.scripts %>/!(header|inline).*'
      ],
      verbose: true
    },
    dev: {
      options: {
        handleFetch: false
      }
    },
    prod: {
      options: {
        handleFetch: true,
        staticFileGlobsAddons: [
          '<%= project.web.assets.mainScript() %>'
        ]
      }
    }
  });

  /**
   * Process static captures for _service_worker
   * TODO: This will create statics for another install script (not swPrecache).
   * @private
   */
  /*
  var options = {
    otherStatics: [{
      file: input,
      captures: [{
        global: true,
        matchIndex: 1,
        re: /url\(([^\)]+)\)/ig
      }]
    }]
  }
  function captureStatics (options) {
    var fs = require('fs');
    var statics = [];

    if (options.otherStatics) {
      options.otherStatics.forEach(function (spec) {
        spec.contents = fs.readFileSync(spec.file, { encoding: 'utf8' });
        spec.captures.forEach(function (capSpec) {
          if (capSpec.global) {
            while ( (capSpec.m = capSpec.re.exec(spec.contents)) !== null ) {
              statics.push(capSpec.m[capSpec.matchIndex]);
            }
          }
        });
      });
      console.log('statics:');
      console.log(statics.join(','));
    }
    return statics;
  }
  */

  /**
   * Custom task to generate the service worker script.
   * Must be run from service-worker task.
   *
   * @access private
   */
  grunt.registerMultiTask('_service_worker', function () {
    var done = this.async();
    var options = this.options();

    // hack to pull font urls from css files
    // this is going elsewhere...
    // var otherStatics = captureStatics(options);

    options.logger = grunt.log.writeln;

    if (options.staticFileGlobsAddons) {
      options.staticFileGlobs = options.staticFileGlobs.concat(options.staticFileGlobsAddons);
    }

    swPrecache.write(options.serviceWorkerScript, options, done);
  });

  /**
   * Custom task to generate the service worker script.
   * Runs nconfig before _service_worker subtask.
   * target must be dev or prod:
   *  service-worker:dev | service-worker:prod
   *
   * @access public
   */
  grunt.registerTask('service-worker', function () {
    var target = this.args.shift();
    var tasks = global._nconfig ? [] : ['nconfig:'+target];

    tasks = tasks.concat([
      'webpack:swReg-'+target,
      '_service_worker:'+target,
      'webpack:sw-'+target
    ]);

    grunt.task.run(tasks);
  });
};
