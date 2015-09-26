/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * All custom header javascript.
 * This is the source of the built asset, not the asset itself.
 */
/* global window */

require('fontfaceobserver/fontfaceobserver');

new window.FontFaceObserver('Source Sans Pro', {})
.check()
.then(function() {
  window.document.documentElement.className += 'fonts-loaded';
})
.catch(function (error) {
  console.error('font failed to load: ', error);
});
