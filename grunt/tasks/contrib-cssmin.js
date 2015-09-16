/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
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
        src: '<%= project.dist.css %>',
        dest: '<%= project.dist.css %>'
      }]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-cssmin');
};
