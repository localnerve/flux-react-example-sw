/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

/**
 * Contain a status code to a finite set.
 * For now, if the code is a 404 it remains 404, otherwise its 500.
 *
 * @param {Number} statusCode - The status code to conform.
 * @returns {Number} 404 or 500.
 */
function conformErrorStatus (statusCode) {
  return statusCode !== 404 ? '500' : '404';
}

module.exports = {
  conformErrorStatus: conformErrorStatus
};
