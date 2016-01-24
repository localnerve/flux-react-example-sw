/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * grunt-contrib-imagemin grunt config.
 * Used to optimize raster images.
 * Requires nconfig task to be run first.
 */
'use strict';

module.exports = function (grunt) {
  grunt.config('imagemin', {
    all: {
      files: [{
        expand: true,
        cwd: '<%= project.src.images %>/',
        src: ['**/*.{jpg,jpeg,png}'],
        dest: '<%= project.dist.images %>/'
      }]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-imagemin');
};
