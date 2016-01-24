/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var path = require('path');

/**
 * The grunt function export
 */
module.exports = function (grunt) {
  grunt.initConfig({
    baseDir: __dirname,
    pkg: grunt.file.readJSON('package.json')
  });

  grunt.loadTasks(path.join(__dirname, 'grunt/tasks'));

  // npm script interface
  grunt.registerTask('default', 'dev');
  grunt.registerTask('dev', ['nconfig:dev', 'clean:before', 'copy', 'jshint', 'concurrent:dev']);
  grunt.registerTask('debug', ['nconfig:dev', 'clean:before', 'copy', 'jshint', 'concurrent:debug']);
  grunt.registerTask('prod', ['nconfig:prod', 'clean:before', 'copy', 'jshint', 'imagemin', 'concurrent:prod']);
  grunt.registerTask('perf', ['nconfig:prod', 'clean:before', 'copy', 'jshint', 'imagemin', 'concurrent:perf']);
  grunt.registerTask('build', [
    'nconfig:prod', 'clean:before', 'copy', 'imagemin', 'ccss:prod', 'webpack:headerProd', 'webpack:prod',
    'service-worker:prod'
  ]);

  // Also commonly used:
  //   1. fixtures:dev | fixtures:prod - generate/update test fixtures from backend
  //   2. jshint
  //   3. dumpconfig:dev | dumpconfig:prod - dump nconfig configuration
  //   4. ccss:dev | ccss:prod - css compile subtasks, dev starts watch
  //   5. header:dev | header:prod - standalone header script compile
  //   6. service-worker:dev | service-worker:prod - standalone service worker generation
};
