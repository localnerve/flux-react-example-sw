/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global Promise, after, before, describe, it */
'use strict';

var expect = require('chai').expect;
var mocks = require('../../../mocks');

describe('sw/init/backgrounds', function () {
  var toolbox, backgrounds,
      mockFetchUnexpected = new Error('unexpected mockFetch results'),
      imageService = 'https://some-service',
      backgroundUrls = {
        '1.jpg': imageService + '/some/path/1.jpg',
        '2.jpg': imageService + '/some/path/2.jpg'
      },
      payload = {
        BackgroundStore: {
          backgroundUrls: backgroundUrls,
          imageServiceUrl: imageService
        }
      };

  before('sw/init/backgrounds', function () {
    global.Request = require('../../../mocks/request');
    global.caches = require('../../../mocks/sw-caches').create();
    mocks.swToolbox.begin();
    toolbox = require('sw-toolbox');

    backgrounds = require('../../../../assets/scripts/sw/init/backgrounds');
  });

  after(function () {
    delete global.Request;
    delete global.caches;
    toolbox.mockTeardown();
    mocks.swToolbox.end();
  });

  function runTest (response) {
    toolbox.mockSetup(response);

    // Run the module under test
    backgrounds(payload);
  }

  it('should add a single route to router', function () {
    runTest();

    expect(toolbox.router.routes.size).to.equal(1);
  });

  it('should handle all imageService requests', function (done) {
    var response = { test: 'yepper' };
    runTest(response);

    Promise.all(Object.keys(backgroundUrls).map(function (key) {
      return toolbox.mockFetch(backgroundUrls[key], 'GET');
    })).then(function (results) {
      results.forEach(function (res) {
        expect(res).to.eql(response);
      });

      if (results && results.length > 0) {
        done();
      } else {
        done(mockFetchUnexpected);
      }
    }).catch(function (error) {
      done(error || mockFetchUnexpected);
    });
  });

  it('should prefetch requests not current', function (done) {
    var response = { test: 'yessir' };
    var keys = Object.keys(backgroundUrls);
    runTest(response);

    toolbox.mockFetch(backgroundUrls[keys[0]], 'GET')
    .then(function (res) {
      expect(res).to.eql(response);
    })
    .then(function () {
      // keys[1] should have been cached as a side-effect.
      toolbox.uncache(backgroundUrls[keys[1]]).then(function (deleted) {
        done(deleted ? null : new Error('notCurrent request was not cached'));
      });
    })
    .catch(function (error) {
      done(error || mockFetchUnexpected);
    });
  });
});
