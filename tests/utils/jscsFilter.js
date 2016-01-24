/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * HACK:
 * This is a jscs error filter to hold me over until I figure out how to disable jsDoc rules
 * only for the test code.
 */
var debug = require('debug')('jscs:errorFilter');

module.exports = function errorFilter (err) {
  debug('jscs err: ', err);

  var ignore =
    err.filename.indexOf('/tests/') !== -1 && err.rule.indexOf('jsDoc') !== -1;

  debug('ignore', ignore);

  return !ignore;
};
