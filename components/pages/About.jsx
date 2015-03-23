/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');

var About = React.createClass({
  getInitialState: function () {
    return {};
  },
  render: function() {
    return (
      <div className="page">
        <div className="grid-container-center page-content">
          <h1>Example About Page</h1>
          <p>
            This is an example about page.
          </p>
          <p>
            This site is an example of techniques using isomorphic Flux and React via&nbsp;
            <a href="http://fluxible.io" _target="blank">Fluxible</a>.
          </p>
        </div>
      </div>
    );
  }
});

module.exports = About;