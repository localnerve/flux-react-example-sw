/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * grunt-concurrent grunt config.
 * Relies on several grunt tasks (see serial task sequences below).
 */
'use strict';

module.exports = function (grunt) {
  grunt.config('concurrent', {
    options: {
      logConcurrentOutput: true
    },
    css: ['_cc-watch-ap', '_cc-watch-compass'],
    dev: ['_cc-compass-dev', '_cc-nodemon-dev', '_cc-webpack-dev'],
    debug: ['_cc-compass-dev', '_cc-nodemon-debug', '_cc-webpack-dev'],
    prod: ['_cc-compass-prod', '_cc-nodemon-prod', '_cc-webpack-prod'],
    perf: ['_cc-compass-prod', '_cc-nodemon-prod', '_cc-webpack-perf']
  });

  grunt.loadNpmTasks('grunt-concurrent');

  // Serial task sequences for concurrent, each sequence an external grunt process
  grunt.registerTask('_cc-watch-compass', ['nconfig:dev', 'compass:watch']);
  grunt.registerTask('_cc-watch-ap', ['nconfig:dev', 'watch:ap']);
  grunt.registerTask('_cc-compass-dev', ['nconfig:dev', 'ccss:dev']);
  grunt.registerTask('_cc-compass-prod', ['nconfig:prod', 'ccss:prod']);
  grunt.registerTask('_cc-nodemon-dev', ['nconfig:dev', 'nodemon:app']);
  grunt.registerTask('_cc-nodemon-debug', ['nconfig:dev', 'nodemon:debug']);
  grunt.registerTask('_cc-nodemon-prod', ['nconfig:prod', 'nodemon:app']);
  grunt.registerTask('_cc-webpack-dev', [
    'nconfig:dev', 'webpack:headerDev', 'service-worker:dev', 'webpack:dev'
  ]);
  grunt.registerTask('_cc-webpack-prod', [
    'nconfig:prod', 'webpack:headerProd', 'webpack:prod', 'service-worker:prod'
  ]);
  grunt.registerTask('_cc-webpack-perf', [
    'nconfig:prod', 'webpack:headerProd', 'webpack:perf', 'service-worker:perf'
  ]);
};
