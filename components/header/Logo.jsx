/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var NavLink = require('flux-router-component').NavLink;

var Logo = React.createClass({
  render: function() {
    return (
      <div className="logo">
        <NavLink routeName="home" title="flux-react-example">
          <h1>PedalPulse</h1>
          <span className="tagline">
            A responsive, reactive demo web app with a good prognosis.
          </span>
        </NavLink>
      </div>
    );
  }
});

module.exports = Logo;