/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var markupData = '<h2>Sunshine and Rainbows</h2>';
var markdownData = '## Unicorns and Rainbows';
var jsonData = JSON.stringify({
  test: {
    testPropTest: 'testValueTest'
  }
});
var validModels = JSON.stringify({
  models: {
    ValidModel1: {
      testProp: 'value'
    },
    ValidModel2: {
      testPropAnother: 'anotherValue'
    }
  }
});
var validModelRef = [ 'ValidModel1' ];
var validMultiModelRef = [ 'ValidModel1', 'ValidModel2' ];
var invalidModelRef = [ 'InvalidModel' ];

var i = 0;
function makeResId () {
  return 'res' + (i++);
}

function makeResource (hasId, idValue, hasFormat, formatValue, hasModels, modelsValue, hasData, dataValue) {
  var testRes = {};

  if (hasId) {
    testRes.resource = idValue || makeResId();
  }
  if (hasFormat) {
    testRes.format = formatValue;
  }
  if (hasModels) {
    testRes.models = modelsValue;
  }
  if (hasData) {
    testRes.data = dataValue;
  }

  return testRes;
}

function makeMarkupResource (hasModels, modelsValue) {
  return makeResource(true, null, true, 'markup', hasModels, modelsValue, true, markupData);
}

module.exports = {
  markupData: markupData,
  markdownData: markdownData,
  jsonData: jsonData,
  models: makeResource(true, 'models', true, 'json', false, null, true, validModels),
  nothing: makeResource(false, null, false, null, false, null, false, null),
  noFormat: makeResource(true, 'test', false, null, false, null, true, jsonData),
  badFormat: makeResource(true, 'test', true, 'bad', false, null, true, jsonData),
  noData: makeResource(true, null, true, undefined, false, null, false, null),
  markup: {
    validNone: makeMarkupResource(false, null),
    validSingle: makeMarkupResource(true, validModelRef),
    validMulti: makeMarkupResource(true, validMultiModelRef),
    invalid: makeMarkupResource(true, invalidModelRef)
  }
};