/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it */
'use strict';

var expect = require('chai').expect;

var requestLib = require('../../../../assets/scripts/sw/utils/requests');

describe('sw', function () {
  describe('requests', function () {
    var absoluteUrlNoSearch = 'http://example.org/route',
        absoluteUrlSearch = 'http://example.org/route?name=value',
        relativeUrlNoSearch = '/test',
        relativeUrlSearch = '/test?name=value',
        newName = 'newName',
        newValue = '123';

    function getSearch(url) {
      return url.split('?')[1];
    }

    function getValueByName(url, name) {
      var re = new RegExp('('+name+'=)([^&]+)');
      var m = re.exec(url, name);
      return m && m[2];
    }

    // test search and nv presence
    function queryStringTest(url, name, value) {
      var search = getSearch(url);
      var foundValue = getValueByName(search, name);
      if (value) {
        expect(foundValue).to.equal(value);
      } else {
        expect(foundValue).to.exist.and.not.be.false;
      }
    }

    // URL is covered in jsdom latest, but it doesn't support node 0.12 :-(
    describe('addOrReplaceUrlSearchParameter', function () {
      it('should add a search parameter to an absolute url without QS', function () {
        var result = requestLib.addOrReplaceUrlSearchParameter(absoluteUrlNoSearch, newName, newValue);
        queryStringTest(result, newName, newValue);
      });

      it('should add a search parameter to an absolute url with QS', function () {
        var result = requestLib.addOrReplaceUrlSearchParameter(absoluteUrlSearch, newName, newValue);
        queryStringTest(result, newName, newValue);
      });

      it('should add a search parameter to a relative url without QS', function () {
        var result = requestLib.addOrReplaceUrlSearchParameter(relativeUrlNoSearch, newName, newValue);
        queryStringTest(result, newName, newValue);
      });

      it('should add a search parameter to a relative url with QS', function () {
        var result = requestLib.addOrReplaceUrlSearchParameter(relativeUrlSearch, newName, newValue);
        queryStringTest(result, newName, newValue);
      });

      it('should replace a search parameter in an absolute url', function () {
        var replaceVal = 'oscarmeyer';
        var result = requestLib.addOrReplaceUrlSearchParameter(absoluteUrlNoSearch, newName, newValue);
        result = requestLib.addOrReplaceUrlSearchParameter(result, newName, replaceVal);
        queryStringTest(result, newName, replaceVal);
      });

      it('should replace a search parameter in a relative url', function () {
        var replaceVal = 'oscarmeyer';
        var result = requestLib.addOrReplaceUrlSearchParameter(relativeUrlNoSearch, newName, newValue);
        result = requestLib.addOrReplaceUrlSearchParameter(result, newName, replaceVal);
        queryStringTest(result, newName, replaceVal);
      });
    });

    describe('stripSearchParameters', function () {
      it('should remove query string for absolute url', function () {
        expect(absoluteUrlNoSearch).to.equal(requestLib.stripSearchParameters(absoluteUrlNoSearch));
      });

      it('should remove query string for relative url', function () {
        expect(relativeUrlNoSearch).to.equal(requestLib.stripSearchParameters(relativeUrlSearch));
      });
    });

    describe('cacheBustRequest', function () {
      it('should add a cache bust param to absolute url', function () {
        var result = requestLib.cacheBustRequest(absoluteUrlNoSearch);
        queryStringTest(result, 'sw-cache');
      });

      it('should add a cache bust param to absolute url with search', function () {
        var result = requestLib.cacheBustRequest(absoluteUrlSearch);
        queryStringTest(result, 'sw-cache');
      });

      it('should add a cache bust param to relative url', function () {
        var result = requestLib.cacheBustRequest(relativeUrlNoSearch);
        queryStringTest(result, 'sw-cache');
      });

      it('should add cache bust param to relative url with search', function () {
        var result = requestLib.cacheBustRequest(relativeUrlSearch);
        queryStringTest(result, 'sw-cache');
      });
    });

    describe.skip('dehydrateRequest', function () {
    });

    describe.skip('rehydrateRequest', function () {
    });
  });
});
