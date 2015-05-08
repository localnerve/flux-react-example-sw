/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var NotFound = require('./NotFound.jsx');
var SinglePage = require('./SinglePage.jsx');
var Contact = require('./contact');
var merge = require('lodash/object/merge');

var pageTypes = {
  SinglePage: SinglePage,
  Contact: Contact
};

function getClass (component) {
  return pageTypes[component] || NotFound;
}

function getProps (content, models) {
  var contentClass = Object.prototype.toString.call(content);
  return contentClass === '[object Object]' ? merge(content, { models: models }) : {
    models: models,
    content: content
  };
}

module.exports = {
  createElement: function (component, content, models) {
    return React.createElement(getClass(component), getProps(content, models));
  }
};
