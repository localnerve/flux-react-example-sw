/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * grunt-svgmin grunt config.
 * Minifies svgs.
 * Requires nconfig task to be run first.
 */
'use strict';

module.exports = function (grunt) {
  grunt.config('svgmin', {
    options: {
    },
    all: {
      files: [{
        expand: true,
        cwd: '<%= project.src.images %>/',
        src: ['**/*.svg'],
        dest: '<%= project.dist.images %>/'
      }]
    }
  });

  grunt.loadNpmTasks('grunt-svgmin');
};
