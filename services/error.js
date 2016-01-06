/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Conform errors to Yahoo fetchr requirements for client reporting.
 */
'use strict';

/**
 * Conform an error to Yahoo Fetchr requirements.
 *
 * @param {String | Object | Error} error - The error to conform, can be null.
 * @param {Number} [statusCode] - An optional statusCode to use to override
 * or define specific statusCode.
 * @returns {Falsy | Error | decorated} A Fetchr conformed error.
 */
function decorateFetchrError (error, statusCode) {
  if (error) {
    error = typeof error === 'object' ? error : new Error(error.toString());

    error.statusCode = error.statusCode || error.status || statusCode || 400;

    error.output = {
      message: error.message,
      full: error.toString()
    };
  }

  return error;
}

module.exports = decorateFetchrError;
