/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * grunt-nodemon grunt config.
 * Relies on nconfig task.
 */
'use strict';

module.exports = function (grunt) {
  grunt.config('nodemon', {
    options: {
      ignore: ['node_modules/**', '<%= project.distbase %>/**'],
      ext: 'js,jsx'
    },
    app: {
      script: './<%= pkg.main %>'
    },
    debug: {
      options: {
        nodeArgs: ['--debug-brk']
      },
      script: './<%= pkg.main %>'
    }
  });

  grunt.loadNpmTasks('grunt-nodemon');
};
