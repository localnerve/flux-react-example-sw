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
        <div className="grid-container-center">
          <NavLink routeName="home" title="flux-react-example">
            <span className="graphics">
            </span>
            <span className="tagline">
              A LocalNerve responsive, reactive demo with a good prognosis.
            </span>
          </NavLink>
        </div>
      </div>
    );
  }
});

module.exports = Logo;