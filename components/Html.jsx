/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Only rendered on the server
 */
'use strict';
var React = require('react');
var ApplicationStore = require('../stores/ApplicationStore');
var FluxibleMixin = require('fluxible').Mixin;

var Component = React.createClass({
  mixins: [ FluxibleMixin ],
  render: function () {
    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>{this.getStore(ApplicationStore).getPageTitle()}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style dangerouslySetInnerHTML={{__html: this.props.styles}}></style>
          <script dangerouslySetInnerHTML={{__html: this.props.trackingSnippet}}></script>
        </head>
        <body>
          <section id="docsapp" dangerouslySetInnerHTML={{__html: this.props.markup}}></section>
          <script dangerouslySetInnerHTML={{__html: this.props.state}}></script>
           <div className="footer">
              <div className="container">
                All code on this site is licensed
                under the <a href="https://github.com/localnerve/flux-react-example/blob/master/LICENSE.md">BSD License</a>,
                unless otherwise stated.
              </div>
              <div className="copyright">
                &copy; {(new Date()).getFullYear()}
              </div>
           </div>
          <script src={this.props.scriptsDir+"/"+(Array.isArray(this.props.assets.main) ? this.props.assets.main[0] : this.props.assets.main)}></script>
        </body>
      </html>
    );
  }
});

module.exports = Component;
