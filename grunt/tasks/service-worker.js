/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Custom service worker tasks and grunt config.
 * Generates service worker scripts.
 * Relies on nconfig and webpack tasks.
 */
 /*jshint multistr: true */
 /* global global */
'use strict';

var swPrecache = require('sw-precache');
var fs = require('fs');

module.exports = function (grunt) {
  grunt.config('_service_worker', {
    options: {
      // options for sw-precache
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
      verbose: true,

      // options for service worker captureData
      captureData: {
        output: '<%= project.src.serviceWorker.data %>',
        assets: [{
          file: '<%= project.src.styles %>/_fonts.scss',
          captures: [{
            global: true,
            matchIndex: 1,
            re: /url\(([^\)]+)\)/ig
          }]
        }],
        api_paths: [{
          file: 'app.js',
          captures: [{
            global: false,
            matchIndex: 1,
            re: /xhrPath\s*\:\s*(?:'|")([^'"]+)/
          }]
        }]
      }
    },
    dev: {
      options: {
        debug: true,
        handleFetch: false
      }
    },
    perf: {
      options: {
        debug: true,
        handleFetch: true,
        staticFileGlobsAddons: [
          '<%= project.web.assets.mainScript() %>'
        ]
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
   * Process data captures for _service_worker
   * Data captures are data and asset references that only exist in source files.
   * (like web font urls, for example)
   *
   * Writes output file to export capture file data to the service worker.
   *
   * @private
   */
  function captureData (options) {
    var output = {
      debug: options.debug ? true : false,
      cacheId: options.cacheId,
      assets: [],
      api_paths: []
    };
    var reClean = /^(?:\s+|"|')|(?:\s+|"|')$/g;
    var replacement = 'DATA';
    var template = '/** This is a generated file **/\n\
module.exports = JSON.parse(JSON.stringify(\n' + replacement + '\n));';

    /**
     * Report output results
     */
    function report (output, name) {
      if (output.length > 0) {
        output.forEach(function (str) {
          grunt.log.writeln('captureData ' + name + ': '+str);
        });
      } else {
        grunt.log.error('captureData captured no ' + name);
      }
    }

    options = options.captureData;

    if (options) {
      // build output.assets, output.api_paths from respective options
      ['assets', 'api_paths'].forEach(function (item) {
        options[item].forEach(function (input) {
          input.contents = fs.readFileSync(input.file, { encoding: 'utf8' });

          input.captures.forEach(function (capSpec) {
            if (capSpec.global) {
              while ( (capSpec.m = capSpec.re.exec(input.contents)) !== null ) {
                output[item].push(capSpec.m[capSpec.matchIndex]
                  .replace(reClean, ''));
              }
            } else {
              capSpec.m = capSpec.re.exec(input.contents);
              if (capSpec.m) {
                output[item].push(capSpec.m[capSpec.matchIndex]
                  .replace(reClean, ''));
              }
            }
          });
        });
        report(output[item], item);
      });

      fs.writeFileSync(options.output, template.replace(replacement, JSON.stringify(
        output
      )));
    } else {
      grunt.fail.fatal('captureData received no input options');
    }
  }

  /**
   * Custom task to generate dynamic service worker scripts.
   * Must be run from service-worker task.
   *
   * @access private
   */
  grunt.registerMultiTask('_service_worker', function () {
    var done = this.async();
    var options = this.options();

    // capture paths, out-of-project assets and produce data.js
    captureData(options);
    delete options.captureData;

    // produce precache.js
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
