/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global before, describe, it */
'use strict';

var expect = require('chai').expect;
var property = require('../../../../utils/property');

describe('sw/sync', function () {
  describe('filters', function () {
    var dehydratedRequests, filters;
    var bodyTemplate = {
      context: {},
      requests: {
        g0: {
          body: {},
          operation: 'CRUD',
          resource: 'test',
          params: {
            _fallback: {
              type: '',
              operation: '',
              key: '',
              userReplayable: false
            },
            field1: 'some',
            field2: 'other',
            field3: 'data'
          }
        }
      }
    };

    var targetType = 'one';
    var targetIds = [2, 3, 5];
    var operations = ['op1', 'op2'];

    function createDataItem (type, op, key, ts, tag) {
      return {
        type: type,
        operation: op,
        key: key,
        timestamp: ts,
        tag: tag
      };
    }

    function createFixturesFromData (dataItems) {
      var tagBase = 1, tag, body, timestamp,
          tagVal, tagEquiv;

      dehydratedRequests = [];

      dataItems.forEach(function (dataItem) {
        body = JSON.parse(JSON.stringify(bodyTemplate));
        timestamp = dataItem.timestamp;
        tag = dataItem.tag;

        delete dataItem.tag;
        delete dataItem.timestamp;
        delete body.requests.g0.params._fallback;

        if (tag) {
          tagVal = 'tagVal-' + tagBase++;

          // make tag values for ts 55 and 60 equivalent for test2
          if (timestamp === 55) {
            tagEquiv = tagEquiv || tagVal;
            tagVal = tagEquiv || tagVal;
          }
          if (timestamp === 60) {
            tagEquiv = tagEquiv || tagVal;
            tagVal = tagEquiv || tagVal;
          }

          body.requests.g0.body.topics = [{
            tag: tagVal
          }];
        }

        dehydratedRequests.push({
          timestamp: timestamp,
          fallback: dataItem,
          method: 'GET',
          url: 'http://localhost',
          bodyType: 'json',
          body: body
        });
      });
    }

    function createFixtures (tags) {
      createFixturesFromData([
        createDataItem('one', 'none', 8, 100),
        createDataItem('two', operations[1], 6, 98, tags ? true : false),
        createDataItem('one', operations[1], targetIds[1], 80, tags ? true : false),
        createDataItem('one', 'none2', 4, 70, tags ? true : false),
        createDataItem('two', operations[0], 1, 99),
        createDataItem('one', operations[1], targetIds[2], 60, tags ? true : false),
        createDataItem('one', operations[0], targetIds[0], 90, tags ? true : false),
        createDataItem('one', operations[0], targetIds[1], 65),
        createDataItem('one', operations[1], targetIds[2], 55, tags ? true : false),
        createDataItem('two', operations[1], targetIds[2], 60)
      ]);
    }

    before(function () {
      filters = require('../../../../assets/scripts/sw/sync/filters');
    });

    describe('latestTypeAndOperation', function () {
      it('should be callable', function () {
        expect(filters).to.respondTo('latest');
      });

      it('should find latest by type and operation', function () {
        createFixtures();

        // should find ts 90, 80, and 60
        var results = filters.latest(
          dehydratedRequests, 'one', operations
        );

        /*
        console.log('@@@');
        console.log(require('util').inspect(results, { depth: null }));
        console.log('@@@');
        */

        expect(Object.prototype.toString.call(results)).to.equal('[object Array]');
        expect(results.length).to.equal(targetIds.length);

        // check found type, operation, and keys
        results.forEach(function (result) {
          expect(result.fallback.type).to.equal(targetType);
          expect(operations).to.include(result.fallback.operation);
          expect(targetIds).to.include(result.fallback.key);
        });
      });

      it('should find latest by type, operation, and prop', function () {
        createFixtures(true);

        // should find ts 90, 80, and 60, but by tag value uniqueness
        var results = filters.latest(
          dehydratedRequests, 'one', operations, 'tag'
        );

        /*
        console.log('@@@');
        console.log(require('util').inspect(results, {depth: null }));
        console.log('@@@');
        */

        expect(Object.prototype.toString.call(results)).to.equal('[object Array]');
        expect(results.length).to.equal(3);

        results.forEach(function (result) {
          expect(result.fallback.type).to.equal(targetType);
          expect(operations).to.include(result.fallback.operation);
        });

        // check for tag uniqueness
        var tagVal, tagValues = [];
        var copyResults = JSON.parse(JSON.stringify(results));
        copyResults.forEach(function (copyResult) {
          tagVal = property.find('tag', copyResult, true);
          expect(tagValues.indexOf(tagVal) === -1);
          tagValues.push(tagVal);
        });
      });
    });

    describe('without', function () {
      it('should be callable', function () {
        expect(filters).to.respondTo('without');
      });

      it('should return all if no exclusions', function () {
        var exclusions = [];
        createFixtures();

        expect(filters.without(dehydratedRequests, exclusions).length)
          .to.equal(dehydratedRequests.length);
      });

      it('should properly return items not excluded', function () {
        var ts2exclude = [99, 70];
        createFixtures();
        var exclusions = dehydratedRequests.filter(function (req) {
          return ts2exclude.indexOf(req.timestamp) !== -1;
        });

        var without =
          filters.without(dehydratedRequests, exclusions).map(function (req) {
            return req.timestamp;
          });

        ts2exclude.forEach(function (excludedTs) {
          expect(without).to.not.include(excludedTs);
        });
      });
    });
  });
});
