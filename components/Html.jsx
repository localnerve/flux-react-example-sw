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
  propTypes: {
    images: React.PropTypes.string.isRequired,
    headerStyles: React.PropTypes.string.isRequired,
    trackingSnippet: React.PropTypes.string.isRequired,
    headerScript: React.PropTypes.string.isRequired,
    markup: React.PropTypes.string.isRequired,
    state: React.PropTypes.string.isRequired,
    mainScript: React.PropTypes.string.isRequired
  },
  render: function () {
    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>{this.getStore(ApplicationStore).getCurrentPageTitle()}</title>
          <meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no" />
          <meta httpEquiv="x-dns-prefetch-control" content="on" />
          <link rel="dns-prefetch" href="//fonts.gstatic.com" />
          <link rel="dns-prefetch" href="//lorempixel.com" />
          <link rel="apple-touch-icon" sizes="57x57" href={this.props.images + '/apple-touch-icon-57x57.png'} />
          <link rel="apple-touch-icon" sizes="60x60" href={this.props.images + '/apple-touch-icon-60x60.png'} />
          <link rel="apple-touch-icon" sizes="72x72" href={this.props.images + '/apple-touch-icon-72x72.png'} />
          <link rel="apple-touch-icon" sizes="76x76" href={this.props.images + '/apple-touch-icon-76x76.png'} />
          <link rel="apple-touch-icon" sizes="114x114" href={this.props.images + '/apple-touch-icon-114x114.png'} />
          <link rel="apple-touch-icon" sizes="120x120" href={this.props.images + '/apple-touch-icon-120x120.png'} />
          <link rel="apple-touch-icon" sizes="144x144" href={this.props.images + '/apple-touch-icon-144x144.png'} />
          <link rel="apple-touch-icon" sizes="152x152" href={this.props.images + '/apple-touch-icon-152x152.png'} />
          <link rel="apple-touch-icon" sizes="180x180" href={this.props.images + '/apple-touch-icon-180x180.png'} />
          <link rel="icon" type="image/png" href={this.props.images + '/favicon-32x32.png'} sizes="32x32" />
          <link rel="icon" type="image/png" href={this.props.images + '/android-chrome-192x192.png'} sizes="192x192" />
          <link rel="icon" type="image/png" href={this.props.images + '/favicon-96x96.png'} sizes="96x96" />
          <link rel="icon" type="image/png" href={this.props.images + '/favicon-16x16.png'} sizes="16x16" />
          <link rel="manifest" href={this.props.images + '/manifest.json'} />
          <meta name="msapplication-TileColor" content="#00a300" />
          <meta name="msapplication-TileImage" content="/mstile-144x144.png" />
          <meta name="theme-color" content="#ffffff" />
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
