/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var NavLink = require('fluxible-router').NavLink;

var Logo = React.createClass({
  propTypes: {
    site: React.PropTypes.object.isRequired
  },

  render: function () {
    return (
      <div className="logo">
        <NavLink routeName="home" title="flux-react-example">
          <h1>
            {this.props.site.name}
          </h1>
          <span className="tagline">
            {this.props.site.tagLine}
          </span>
        </NavLink>
      </div>
    );
  }
});

module.exports = Logo;
