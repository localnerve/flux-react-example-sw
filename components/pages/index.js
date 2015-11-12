/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var merge = require('lodash/object/merge');
var conformErrorStatus = require('../../utils').conformErrorStatus;
var Spinner = require('./Spinner.jsx');

/***
 * Component to class map
 */
var pageTypes = {
  ContentPage: require('./ContentPage.jsx'),
  Contact: require('./contact')
};

/**
 * Exchange a component string for a React class.
 *
 * @param {String} component - The name of a page component.
 * @returns {Object} A React class named by the component parameter.
 */
function getClass (component) {
  return pageTypes[component];
}

/**
 * Form a props object given content and models.
 *
 * @param {String|Object} content - page html or json content.
 * @param {Object} models - Json containing models for the page.
 * @returns {Object} If content is undefined returns a spinner property,
 * otherwise returns an object with content and models.
 */
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
 *
 * @param {Object} error - A fluxible routes navigationError.
 * @param {Number} error.statusCode - The error status code.
 * @param {Object} pages - A routes object from RouteStore.
 * @param {Number} ordinal - A zero based order for the current page in the routes Object.
 * @returns {Array} An ordered array of the main navigable pages of the application.
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
 *
 * @param {Array} navPages - An ordered array of the main navigable pages.
 * @param {Object} contentStore - A reference to the ContentStore.
 * @returns {Array} Array of React Elements, one for each navPage.
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

/**
 * Create a React element for a modal dialog given component and props.
 *
 * @param {String} component - The name of the component for the modal.
 * @param {Object} props - The props for the component.
 * @param {Boolean} failure - Modal creation failure.
 * @returns {Object} A React Element.
 */
function createModalElement (component, props, failure) {
  if (component) {
    props = props || {};

    props = merge(getProps(props.content, props.models), { failure: failure });

    return React.createElement(component, props);
  }
  return React.createElement(Spinner);
}


module.exports = {
  createElements: createElements,
  getMainNavPages: getMainNavPages,
  createModalElement: createModalElement
};
