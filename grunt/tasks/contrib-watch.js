/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * grunt-contrib-watch grunt config.
 * Requires the nconfig task to be run first.
 */
'use strict';

module.exports = function (grunt) {
  grunt.config('watch', {
    // autoprefixer
    ap: {
      options: {
        spawn: false
      },
      files: '<%= project.dist.styles %>/*.css',
      tasks: ['autoprefixer']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
};
