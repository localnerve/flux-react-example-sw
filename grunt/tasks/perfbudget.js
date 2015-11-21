/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * grunt-perfbudget grunt config.
 */
'use strict';

module.exports = function (grunt) {
  grunt.config('perfbudget', {
    options: {
      url: process.env.DEPLOY_URL,
      key: process.env.WPT_API_KEY,
      location: 'Dulles:Chrome',
      repeatView: false,
      timeout: 300
    },
    mobile: {
      options: {
        connectivity: '3G',
        emulateMobile: true,
        runs: 3,
        budget: {
          SpeedIndex: 3000
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-perfbudget');
};
