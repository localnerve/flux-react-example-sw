/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Custom nconfig and dumpconfig tasks and their grunt configs.
 * Sets node config for the grunt process.
 */
 /* global global */
'use strict';

var baseDir = '../..';

module.exports = function (grunt) {
  grunt.config('nconfig', {
    dev: {
      options: {
        overrides: {},
        env: {
          DEBUG: '*',
          // ERR_HANDLER_MAINT_ENABLED: TRUE,
          ERR_HANDLER_MAINT_RETRYAFTER: 7200
          // Can add any env vars here to test out in dev
        }
      }
    },
    prod: {
      options: {
        env: {
          NODE_ENV: 'production'
        }
      }
    }
  });

  /**
   * nconfig custom task
   * Creates a config for the project, saves nconfig.settings to grunt.config('project')
   * Must run per grunt process.
   *
   * Options:
   *  overrides: An object with config settings that overrides all.
   *             example: settings:dist:images
   *  env: Set environment variables for this process.
   *
   * @access public
   */
  grunt.registerMultiTask('nconfig', 'Assign config settings to grunt project', function () {
    global._nconfig = true;
    var configLib = require(baseDir + '/configs');
    var options = this.options();

    if (options.env) {
      Object.keys(options.env).forEach(function(key) {
        process.env[key] = options.env[key];
      });
    }

    grunt.config('project', configLib.create(options.overrides).settings);
  });

  /**
   * Debug the nconfig task.
   * Dumps the computed config to the console.
   * Private task used by dumpconfig.
   *
   * @access private
   */
  grunt.registerTask('_dumpconfigTask', function() {
    var util = require('util');
    var config = require(baseDir + '/configs').create();
    var dump = {
      project: grunt.config('project'),
      nconf: config
    };
    console.log(util.inspect(dump, { depth: null }));
  });

  /**
   * dumpconfig custom task.
   * Dumps the computed nconfig to the console by env.
   * Syntax: dumpconfig:prod | dumpconfig:dev
   *
   * @access public
   */
  grunt.registerTask('dumpconfig', 'Debug nconfig', function() {
    var isProd = this.args.shift() === 'prod';
    var tasks = ['nconfig:'+(isProd ? 'prod' : 'dev')];

    grunt.task.run(tasks.concat('_dumpconfigTask'));
  });
};
