/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var ByLine = require('./ByLine.jsx');
var SiteBullets = require('./SiteBullets.jsx');
var License = require('./License.jsx');
var LocalBusiness = require('./LocalBusiness.jsx');

var Footer = React.createClass({
  propTypes: {
    models: React.PropTypes.object.isRequired
  },

  render: function () {
    return (
      <footer className="app-footer">
        <SiteBullets items={this.props.models.SiteInfo.site.bullets} />
        <LocalBusiness business={this.props.models.LocalBusiness} />
        <License license={this.props.models.SiteInfo.license} />
        <ByLine author={this.props.models.SiteInfo.developer} />
      </footer>
    );
  }
});

module.exports = Footer;
