/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * All custom header javascript.
 * This is the source of the built asset, not the asset itself.
 * This is an entry module, so there are no global concerns here.
 */
/* global window */

// --------------------------------------------------
// Fontface observer to quickly load fonts.
// Relies on Promise polyfill.
//

require('fontfaceobserver/fontfaceobserver');

new window.FontFaceObserver('Source Sans Pro', {})
.check()
.then(function() {
  window.document.documentElement.className += 'fonts-loaded';
})
.catch(function (error) {
  console.error('font failed to load: ', error);
});

// --------------------------------------------------
// Load non-critical stylesheets if html imports not supported.
//

/**
 * Create new stylesheet links from html imports.
 */
/*
function createStylesheetLinks () {
  var i, anImport, stylesheetLink,
      links = [],
      cssImports = document.querySelectorAll('link[rel=import][href$=".css"]');

  for (i = 0; i < cssImports.length; i++) {
    anImport = cssImports[i];
    stylesheetLink = document.createElement('link');
    stylesheetLink.rel = 'stylesheet';
    stylesheetLink.href = anImport.href;
    links.push(stylesheetLink);
  }

  return links;
}
*/
/**
 * Inject stylesheet links into the bottom of the head.
 */
/*
function injectStylesheetLinks () {
  var links = createStylesheetLinks();

  var refs = document.getElementsByTagName('head')[0].childNodes;
  var ref = refs[ refs.length - 1 ];

  links.forEach(function (link) {
    ref.parentNode.insertBefore(link, ref.nextSibling);
  });

}
*/
/*
var supportsImports = 'import' in document.createElement('link');
if (!supportsImports) {
  // If html imports not supported, inject the non critical stylesheets.

  var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

  if (raf) {
    raf(injectStylesheetLinks);
  } else {
    window.addEventListener('load', injectStylesheetLinks);
  }
}
*/
