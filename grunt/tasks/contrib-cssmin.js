/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * grunt-contrib-cssmin grunt config.
 * Requires nconfig task to be run first.
 */
'use strict';

module.exports = function (grunt) {
  grunt.config('cssmin', {
    prod: {
      files: [{
        expand: true,
        cwd: '<%= project.dist.styles %>',
        src: '*.css',
        dest: '<%= project.dist.styles %>'
      }]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-cssmin');
};
