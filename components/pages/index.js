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
  var props;

  if (content) {
    props = Object.prototype.toString.call(content) === '[object Object]' ?
      merge(content, { models: models }) : {
        models: models,
        content: content
      };
  } else {
    props = {
      spinner: true
    };
  }

  return props;
}

function createElements (pages, contentStore) {
  return Object.keys(pages).map(function (page) {
    var data = contentStore.get(page) || {};

    return React.createElement('div', { key: page },
      React.createElement(
        getClass(pages[page].component),
        getProps(data.content, data.models)
      )
    );
  });
}

module.exports = {
  createElements: createElements
};
