/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Example:Markdown');

var Remarkable = require('remarkable');
var remarkable = new Remarkable('full', {
  html: true,
  linkify: true
});

/**
 * Parse markdown to markup.
 *
 * @param {String} input - The markdown to parse.
 * @returns {String} The markup.
 */
function markdown (input) {
  debug('parsing markdown');

  return remarkable.render(input);
}

module.exports = markdown;
