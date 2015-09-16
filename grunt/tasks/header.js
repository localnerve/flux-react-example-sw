/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Custom compile header script task.
 * Compiles the header script in a task series or standalone.
 * Relies on nconfig, webpack.
 */
'use strict';

module.exports = function (grunt) {
  /**
   * Custom task to build the header script, standalone (w/o the dev task).
   * For now, just uses webpack, but that makes it unnecessarily bigger.
   * Syntax: header:dev | header:prod
   *
   * @access public
   */
  grunt.registerTask('header', 'Build the header script', function() {
    var isProd = this.args.shift() === 'prod';
    var tasks;
    if (isProd) {
      tasks = ['nconfig:prod', 'webpack:headerProd'];
    }
    else {
      tasks = ['nconfig:dev', 'webpack:headerDev'];
    }
    grunt.task.run(tasks);
  });
};
