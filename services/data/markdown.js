/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Example:Markdown');

var marked = require('marked');

function markdown(input) {
  debug('parsing markdown');

  return marked(input);
}

module.exports = markdown;