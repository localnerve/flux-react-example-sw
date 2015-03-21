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
      <section className="logo">
        <NavLink routeName="home">
          <span className="graphics">
          </span>
          <span className="tagline">
            A React demo with a good prognosis
          </span>
        </NavLink>
      </section>
    );
  }
});

module.exports = Logo;