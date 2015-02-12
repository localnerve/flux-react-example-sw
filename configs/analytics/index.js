/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
 /*jshint multistr: true */
'use strict';

var uaID = {
  development: 'UA-XXXXXXXX-D',
  production: 'UA-XXXXXXXX-P'
};

var uaRef = 'ga';

var trackingTemplate = '(function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){ \
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o), \
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m) \
})(window,document,"script","//www.google-analytics.com/analytics.js","__UAREF__"); \
__UAREF__("create", "__UAID__", "auto"); \
__UAREF__("send", "pageview");';

function makeConfig(nconf) {
 return {
    snippet: trackingTemplate.replace(/__UAID__/g, uaID[process.env.NODE_ENV || 'development']).replace(/__UAREF__/g, uaRef),
    globalRef: uaRef
  }; 
}

module.exports = makeConfig;