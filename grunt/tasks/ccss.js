/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Custom compile css task.
 * Compiles the scss in a task series or standalone.
 * Relies on nconfig, concurrent, svgmin, svg2png, compass, and autoprefixer.
 */
 /* global global */
'use strict';

module.exports = function (grunt) {
  /**
   * scss compile custom task
   * Sets the env config if req'd, runs required css build tasks, compiles, then runs post processing.
   * Used only for standalone css builds outside of the main dev task.
   * Syntax: ccss:prod | ccss:dev
   *
   * @access public
   */
  grunt.registerTask('ccss', 'Compile scss', function () {
    var isProd = this.args.shift() === 'prod';
    var tasks = global._nconfig ? [] : ['nconfig:'+(isProd ? 'prod' : 'dev')];

    tasks = tasks.concat([
      'svg2png', 'svgmin', 'compass:'+(isProd ? 'prod' : 'dev'), 'autoprefixer'
    ]);
    if (!isProd) {
      tasks = tasks.concat(['concurrent:css']);
    }

    grunt.task.run(isProd ? tasks.concat(['cssmin:prod']) : tasks);
  });
};
