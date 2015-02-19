/**
 * Copyright 2015, Alex Grant, LocalNerve, LLC.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 */
'use strict';

function testTransform(expect, expected, actual) {
  Object.keys(expected).forEach(function(key) {
    expect(expected[key].page).to.eql(actual[key].page);
    expect(expected[key].path).to.eql(actual[key].path);
    expect(expected[key].method).to.eql(actual[key].method);
    expect(expected[key].label).to.eql(actual[key].label);
    expect(expected[key].action+'').to.equal(actual[key].action+'');
  });
}

module.exports = {
  testTransform: testTransform
};