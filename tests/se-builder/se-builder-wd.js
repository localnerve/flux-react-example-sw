var wd = require('wd')
  , _ = require('underscore')
  , fs = require('fs')
  , path = require('path')
  , uuid = require('uuid-js');
var VARS = {};

var b = wd.promiseRemote();

b.on('status', function(info){console.log('[36m%s[0m', info);});b.on('command', function(meth, path, data){  console.log(' > [33m%s[0m: %s', meth, path, data || '');});
b.init({
  browserName:'firefox'
})
.then(function () { return b.get("http://localhost:3000/"); })
.then(function () { return b.elementByTagName('html'); })
.then(function (el) { return el.text(); })
.then(function (text) {
  var bool = text.indexOf("Hello World") != -1;
if (!bool) {
  b.quit(null);
  console.log('verifyTextPresent failed');
}
})
.then(function () { return b.elementByLinkText("About"); })
.then(function (el) { return b.clickElement(el); })
.then(function () { return b.elementByTagName('html'); })
.then(function (el) { return el.text(); })
.then(function (text) {
  var bool = text.indexOf("Example About Page") != -1;
if (!bool) {
  b.quit(null);
  console.log('verifyTextPresent failed');
}
})
.then(function () { return b.get("http://localhost:3000/about"); })
.then(function () { return b.elementByTagName('html'); })
.then(function (el) { return el.text(); })
.then(function (text) {
  var bool = text.indexOf("Example About Page") != -1;
if (!bool) {
  b.quit(null);
  console.log('verifyTextPresent failed');
}
})
.then(function () { return b.elementByLinkText("Home"); })
.then(function (el) { return b.clickElement(el); })
.then(function () { return b.elementByTagName('html'); })
.then(function (el) { return el.text(); })
.then(function (text) {
  var bool = text.indexOf("Hello World") != -1;
if (!bool) {
  b.quit(null);
  console.log('verifyTextPresent failed');
}
})
.fin(function () {
b.quit();
}).done();
