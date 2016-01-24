/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Custom fixtures task and grunt config.
 * Generates the test fixtures from the backend. Run as needed.
 * Relies on nconfig task.
 */
'use strict';

module.exports = function (grunt) {
  grunt.config('fixtures', {
    options: {
      generators: '<%= baseDir %>/tests/generators',
      'routes-models.js': {
        output: {
          routes: 'tests/fixtures/routes-response.js',
          models: 'tests/fixtures/models-response.js'
        }
      }
    }
  });

  /**
   * _runFixtureGenerators custom task
   * Runs the fixture generators using backend data services.
   * Backend data sources selected by environment -
   *   Must be run after nconfig
   * This private task is only run by 'fixtures' task.
   *
   * @access private
   */
  grunt.registerTask('_runFixtureGenerators', 'Subtask to generate test fixtures', function () {
    var fs = require('fs');
    var path = require('path');
    var generator, options = this.options();

    var async = this.async();

    fs.readdirSync(options.generators).forEach(function (item) {
      generator = path.join(options.generators, item);
      grunt.log.writeln(
        'Executing '+generator + '(' +
          require('util').inspect(options[item].output) + ', callback)'
      );
      require(generator)(options[item].output, async);
    });
  });

  /**
   * fixtures custom task
   * Runs nconfig and _runFixtureGenerators in order.
   * Syntax: fixtures:dev | fixtures:prod
   *
   * @access public
   */
  grunt.registerTask('fixtures', 'Generate test fixtures', function () {
    var isProd = this.args.shift() === 'prod';
    var options = {
      options: this.options()
    };

    var tasks = [
      'nconfig:'+(isProd ? 'prod' : 'dev'),
      '_runFixtureGenerators'
    ];

    // Pass along the options to subtasks
    grunt.config.set('_runFixtureGenerators', options);

    grunt.task.run(tasks);
  });
};
