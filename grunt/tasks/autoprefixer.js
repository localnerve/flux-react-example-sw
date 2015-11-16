/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * grunt-autoprefixer grunt config.
 * Requires nconfig task to be run first.
 */
'use strict';

module.exports = function (grunt) {
  grunt.config('autoprefixer', {
    options: {
      browsers: ['last 2 versions', '> 2% in US']
    },
    all: {
      files: [{
        expand: true,
        cwd: '<%= project.dist.styles %>',
        src: '*.css',
        dest: '<%= project.dist.styles %>'
      }]
    }
  });

  grunt.loadNpmTasks('grunt-autoprefixer');
};
