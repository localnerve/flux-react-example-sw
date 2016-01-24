/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * grunt-svg2png grunt config.
 * Generates png fallbacks.
 * Requires nconfig task to be run first.
 */
'use strict';

module.exports = function (grunt) {
  grunt.config('svg2png', {
    all: {
      files: [{
        cwd: '<%= project.src.images %>/',
        src: ['**/*.svg'],
        dest: '<%= project.dist.images %>/'
      }]
    }
  });

  grunt.loadNpmTasks('grunt-svg2png');
};
