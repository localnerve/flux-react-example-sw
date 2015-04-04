/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var NotFound = require('./NotFound.jsx');
var SinglePage = require('./SinglePage.jsx');

var pageTypes = {
  SinglePage: SinglePage
};

module.exports = function(component) {
  return pageTypes[component] || NotFound;
};