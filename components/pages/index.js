/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var SinglePage = require('./SinglePage.jsx');
var Contact = require('./contact');
var conformErrorStatus = require('../../utils').conformErrorStatus;
var merge = require('lodash/object/merge');

var pageTypes = {
  SinglePage: SinglePage,
  Contact: Contact
};

function getClass (component) {
  return pageTypes[component];
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

/**
 * Return the main navigable pages for the app as an ordered array.
 * These are routes that have mainNav === 'true'.
 * If there is an error, the page at the ordinal will be the required error page.
 */
function getMainNavPages (error, pages, ordinal) {
  var mainPages = Object.keys(pages)
  .filter(function (page) {
    return pages[page].mainNav;
  })
  .sort(function (a, b) {
    return pages[a].order - pages[b].order;
  })
  .map(function (page) {
    return pages[page];
  });

  if (error) {
    mainPages[ordinal] = pages[conformErrorStatus(error.statusCode)];
  }

  return mainPages;
}

/**
 * Create React elements for the given navigable pages.
 * Unfortunately, the key and id have to always be the same for each slot for swipe.
 */
function createElements (navPages, contentStore) {
  var count = 0, key = 'page';

  return navPages.map(function (np) {
    var data = contentStore.get(np.page) || {};

    return React.createElement('div', {
        key: key + count,
        id: key + count++
      }, React.createElement(
          getClass(np.component),
          getProps(data.content, data.models)
      )
    );
  });
}

module.exports = {
  createElements: createElements,
  getMainNavPages: getMainNavPages
};
