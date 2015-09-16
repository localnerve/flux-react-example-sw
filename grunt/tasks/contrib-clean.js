/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * grunt-contrib-clean grunt config.
 * Requires nconfig task to be run first.
 */
'use strict';

module.exports = function (grunt) {
  grunt.config('clean', {
    before: [
      '<%= project.dist.baseDir %>',
      '<%= project.src.assetsJson %>'
    ]
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
};
