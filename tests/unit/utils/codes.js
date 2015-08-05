/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it */
'use strict';

var expect = require('chai').expect;

var conformErrorStatus = require('../../../utils').conformErrorStatus;

describe('conformErrorStatus', function () {
  it('should conform error status 404 to \'404\'', function () {
    var status = conformErrorStatus(404);
    expect(status).to.equal('404');
    expect(status).to.not.equal(404);
  });

  it('should conform any other status to \'500\'', function () {
    [
      0, 200, 300, 304, 400, 401, 403, '404', 410, 412, 499, 500, 501, 503
    ].forEach(function (status) {
      expect(conformErrorStatus(status)).to.equal('500');
    });
  });
});
