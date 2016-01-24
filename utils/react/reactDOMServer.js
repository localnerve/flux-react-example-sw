/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Build stub for ReactDOMServer to keep it out of the client bundle.
 * Legacy, React 0.14.x
 */
'use strict';

var noop = require('lodash/utility/noop');

/**
 * ReactDOMServer dummy.
 */
var ReactDOMServer = {
  renderToString: noop,
  renderToStaticMarkup: noop
};

module.exports = ReactDOMServer;
