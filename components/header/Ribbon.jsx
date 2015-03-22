/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');

var Ribbon = React.createClass({
  render: function() {
    return (
      <div className="ribbon">
        <div className="contact">
          Contact stuff
        </div>
        <div className="social">
          Social stuff
        </div>
      </div>
    );
  }
});

module.exports = Ribbon;