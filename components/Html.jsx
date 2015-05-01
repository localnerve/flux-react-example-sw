/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Only rendered on the server
 */
'use strict';
var React = require('react');
var ApplicationStore = require('../stores/ApplicationStore');
var FluxibleMixin = require('fluxible/addons/FluxibleMixin');

var Html = React.createClass({
  mixins: [ FluxibleMixin ],
  render: function () {
    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>{this.getStore(ApplicationStore).getCurrentPageTitle()}</title>
          <meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no" />
          <meta httpEquiv="x-dns-prefetch-control" content="on" />
          <link rel="dns-prefetch" href="http://fonts.gstatic.com" />
          <style dangerouslySetInnerHTML={{__html: this.props.headerStyles}}></style>
          <script dangerouslySetInnerHTML={{__html: this.props.trackingSnippet}}></script>
        </head>
        <body>
          <script dangerouslySetInnerHTML={{__html: this.props.headerScript}}></script>
          <section id="application" className="app-frame"
            dangerouslySetInnerHTML={{__html: this.props.markup}}>
          </section>
          <script dangerouslySetInnerHTML={{__html: this.props.state}}></script>
          <script src={this.props.mainScript}></script>
        </body>
      </html>
    );
  }
});

module.exports = Html;
