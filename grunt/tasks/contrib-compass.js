/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * grunt-contrib-compass grunt config.
 * Requires nconfig task to be run first.
 */
'use strict';

module.exports = function (grunt) {
  grunt.config('compass', {
    options: {
      sassDir: '<%= project.src.styles %>',
      imagesDir: '<%= project.dist.images %>',
      httpImagesPath: '<%= project.web.images %>',
      fontsDir: '<%= project.dist.fonts %>',
      httpFontsPath: '<%= project.web.fonts %>',
      cssDir: '<%= project.dist.styles %>',
      httpPath: '/',
      importPath: [
        '<%= project.vendor.css %>',
        '<%= project.src.components %>',
        'node_modules/react-spinner'
      ],
      environment: 'development',

      httpGeneratedImagesPath: '<%= project.web.images %>'
    },
    dev: {
      options: {
        watch: false
      }
    },
    watch: {
      options: {
        watch: true
      }
    },
    prod: {
      options: {
        outputStyle: 'compressed',
        noLineComments: true,
        environment: 'production'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-compass');
};
