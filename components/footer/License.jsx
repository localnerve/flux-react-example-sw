/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');

var License = React.createClass({
  propTypes: {
    license: React.PropTypes.object.isRequired
  },

  render: function () {
    var statements = this.props.license.statement.split(
      this.props.license.type
    );

    return (
      <div className="grid-row-spaced footer-line">
        <span className="license">
          {statements[0]}
          <a href={this.props.license.url}>
            {this.props.license.type}
          </a>
          {statements[1]}
        </span>
      </div>
    );
  }
});

module.exports = License;
