/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * grunt-contrib-jshint grunt config.
 */
'use strict';

module.exports = function (grunt) {
  grunt.config('jshint', {
    options: {
      jshintrc: true
    },
    all: {
      src: [
        '*.js',
        '{configs,utils,actions,components,services,stores,tests}/**/*.js'
      ]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
};
