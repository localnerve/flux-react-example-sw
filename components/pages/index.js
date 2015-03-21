/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var Home = require('./Home.jsx');
var About = require('./About.jsx');
var NotFound = require('./NotFound.jsx');

var pages = {
  about: About,
  home: Home
};

module.exports = function(page) {
  return pages[page] || NotFound;
};