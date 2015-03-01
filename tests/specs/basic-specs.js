/* global describe, it, before, afterEach, after */
'use strict';

var wd = require('wd');
require('colors');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var browserSpecs = require('./browsers');

chai.use(chaiAsPromised);
chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

// http configuration, not needed for simple runs
wd.configureHttp({
  timeout: 60000,
  retryDelay: 15000,
  retries: 5
});

var testName = 'Basic test';
var baseUrl = process.env.TEST_BASEURL || 'http://localhost:3000';

// browser capability
var browserKey = process.env.TEST_BROWSER || 'chrome';
var test = browserSpecs[browserKey];
test.name = testName + ' with ' + browserKey;
test.tags = ['flux-react-example'];
if (process.env.TRAVIS) {
  test.tags = test.tags.concat('travis', process.env.TRAVIS_BRANCH);
  test.build = process.env.TRAVIS_BUILD_NUMBER;
}

describe(testName+' (' + test.browserName + ')', function() {
  this.timeout(60000);
  var browser;
  var allPassed = true;

  before(function(done) {
    var username = process.env.SAUCE_USERNAME;
    var accessKey = process.env.SAUCE_ACCESS_KEY;
    browser = wd.promiseChainRemote('ondemand.saucelabs.com', 80, username, accessKey);
    if (process.env.VERBOSE) {
      // optional logging     
      browser.on('status', function(info) {
        console.log(info.cyan);
      });
      browser.on('command', function(meth, path, data) {
        console.log(' > ' + meth.yellow, path.grey, data || '');
      });
    }
    browser
      .init(test)
      .nodeify(done);
  });

  afterEach(function(done) {
    allPassed = allPassed && (this.currentTest.state === 'passed');  
    done();
  });

  after(function(done) {
    browser
      .quit()
      .sauceJobStatus(allPassed)
      .nodeify(done);
  });

  it('should get home page and navigate to about', function(done) {
    browser
      .get(baseUrl)
      .title()
      .should.eventually.include('Flux React Example')
      .elementByTagName('h1')
      .text()
      .should.eventually.include('Hello World')
      .elementByLinkText('About')
      .click()
      .waitForElementByTagName('h1')
      .text()
      .should.eventually.include('Example About Page')
      .nodeify(done);
  });

  it('should get about page and navigate to home', function(done) {
    browser
      .get(baseUrl+'/about')
      .title()
      .should.eventually.include('About')
      .elementByTagName('h1')
      .text()
      .should.eventually.include('About')
      .elementByLinkText('Home')
      .click()
      .waitForElementByTagName('h1')
      .text()
      .should.eventually.include('Hello World')
      .nodeify(done);
  });
});