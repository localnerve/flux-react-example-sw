/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it */
'use strict';

var expect = require('chai').expect;

var buildImageUrl = require('../../../utils').buildImageUrl;

describe('imageServiceUrls', function () {
  describe('buildImageUrl', function () {
    it('should build a lorempixel url with random numeric image', function () {
      var serviceUrl = 'http://lorempixel.com',
          width = 10,
          height = 20,
          name = 'tester';

      var url = buildImageUrl(serviceUrl, {
        width: width,
        height: height,
        name: name
      });

      expect(url).to.match(new RegExp('^' + serviceUrl));
      expect(url).to.contain(width);
      expect(url).to.contain(height);
      expect(url).to.not.contain(name);
      expect(url).to.match(/[1-9]\/$/);
    });

    it('should build a lorempixel url from image base name, not zero', function () {
      var serviceUrl = 'http://lorempixel.com',
          width = 10,
          height = 20,
          name = '0.jpg';

      var url = buildImageUrl(serviceUrl, {
        width: width,
        height: height,
        name: name
      });

      expect(url).to.match(new RegExp('^' + serviceUrl));
      expect(url).to.contain(width);
      expect(url).to.contain(height);
      expect(url).to.not.contain(name);
      expect(url).to.match(/[1-9]\/$/);
    });

    it('should build a lorempixel url from image base name', function () {
      var imageName = '4';
      var serviceUrl = 'http://lorempixel.com',
          width = 10,
          height = 20,
          name = imageName + '.jpg';

      var url = buildImageUrl(serviceUrl, {
        width: width,
        height: height,
        name: name
      });

      expect(url).to.match(new RegExp('^' + serviceUrl));
      expect(url).to.contain(width);
      expect(url).to.contain(height);
      expect(url).to.not.contain(name);
      expect(url).to.match(new RegExp(imageName +'\/$'));
    });

    it('should build a lorempixel url from image name', function () {
      var serviceUrl = 'http://lorempixel.com',
          width = 10,
          height = 20,
          name = '4';

      var url = buildImageUrl(serviceUrl, {
        width: width,
        height: height,
        name: name
      });

      expect(url).to.match(new RegExp('^' + serviceUrl));
      expect(url).to.contain(width);
      expect(url).to.contain(height);
      expect(url).to.contain(name);
      expect(url).to.match(new RegExp(name +'\/$'));
    });

    it('should build a firesize url', function () {
      var serviceUrl = 'http://1233321.firesize.com',
          width = 30,
          height = 40,
          name = 'tester2';

      var url = buildImageUrl(serviceUrl, {
        width: width,
        height: height,
        name: name
      });

      expect(url).to.match(new RegExp('^' + serviceUrl));
      expect(url).to.contain(width);
      expect(url).to.contain(height);
      expect(url).to.contain(name);
    });
  });
});
