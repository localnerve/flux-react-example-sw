var wd = require('wd'),
    chai = require('chai'),
    expect = chai.expect,
    _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    uuid = require('uuid-js');

var VARS = {};

// This assumes that selenium is running at http://127.0.0.1:4444/wd/hub/
var noop = function() {},
    b = wd.remote();

describe('Selenium Test Case', function() {

  this.timeout(60000);

  it('should execute test case without errors', function(done) {

    b.chain(function(err) {
      done(err);
    })
    .init({
      browserName: 'firefox'
    })
    .get("http://localhost:3000/")
    .elementByTagName('html', function(err, el) {
      b.next('text', el, function(err, text) {
        expect("" + text).to.contain("" + "Hello World");
      });
    })
    .elementByLinkText("About", function(err, el) {
      b.next('clickElement', el, noop);
    })
    .elementByTagName('html', function(err, el) {
      b.next('text', el, function(err, text) {
        expect("" + text).to.contain("" + "Example About Page");
      });
    })
    .get("http://localhost:3000/about")
    .elementByTagName('html', function(err, el) {
      b.next('text', el, function(err, text) {
        expect("" + text).to.contain("" + "Example About Page");
      });
    })
    .elementByLinkText("Home", function(err, el) {
      b.next('clickElement', el, noop);
    })
    .elementByTagName('html', function(err, el) {
      b.next('text', el, function(err, text) {
        expect("" + text).to.contain("" + "Hello World");
      });
    })
    .close(function(err) {
      done(err);
    });

  });
});

afterEach(function() {
  b.quit();
});
