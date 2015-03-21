/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');

var Home = React.createClass({
  getInitialState: function () {
    return {};
  },
  render: function() {
    return (
      <div className="page">
        <h1>Hello World</h1>
        <p>
          This is an example isomorphic Flux/React application. 
        </p>
        <p>
          It uses Yahoo's&nbsp;<a href="http://fluxible.io" _target="blank">Fluxible</a>&nbsp;architecture.
        </p>
        <p>
          This is a test of fluxible with bootstrapped dynamic routes.
        </p>
      </div>
    );
  }
});

module.exports = Home;