/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

function conformErrorStatus (statusCode) {
  return statusCode !== 404 ? '500' : '404';
}

module.exports = {
  conformErrorStatus: conformErrorStatus
};
