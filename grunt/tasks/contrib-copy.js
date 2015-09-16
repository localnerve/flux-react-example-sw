/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * grunt-contrib-copy grunt config.
 * Requires nconfig task to be run first.
 */
'use strict';

module.exports = function (grunt) {
  grunt.config('copy', {
    assets: {
      files: [{
        expand: true,
        cwd: '<%= project.src.assets %>',
        src: ['**', '!**/styles/**', '!images/*.svg', '!scripts/**'],
        dest: '<%= project.dist.baseDir %>/'
      }]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
};
