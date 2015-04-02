/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
 /* global it */
'use strict';

var test = require('./sauce-travis');

it('should get home page and navigate to about', function(done) {
  test.state.browser
    .get(test.baseUrl)
    .title()
    .should.eventually.include('Flux React Example')
    .elementByTagName('h2')
    .text()
    .should.eventually.include('Hello World')
    .elementByLinkText('About')
    .click()
    .waitForElementByTagName('h2')
    .text()
    .should.eventually.include('Example About Page')
    .nodeify(done);
});

it('should get about page and navigate to home', function(done) {
  test.state.browser
    .get(test.baseUrl+'/about')
    .title()
    .should.eventually.include('About')
    .elementByTagName('h2')
    .text()
    .should.eventually.include('About')
    .elementByLinkText('Home')
    .click()
    .waitForElementByTagName('h2')
    .text()
    .should.eventually.include('Hello World')
    .nodeify(done);
});