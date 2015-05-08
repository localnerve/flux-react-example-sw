/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');

var ByLine = React.createClass({
  render: function () {
    var byLine = this.props.author.byLine.replace(
      ' '+this.props.author.name, ''
    );

    return (
      <div className="grid-row-spaced footer-line">
        <span>
          {byLine}&nbsp;
          <a href={this.props.author.url} _target="blank">
            {this.props.author.name}
          </a>
          &nbsp;&copy;&nbsp;{(new Date()).getFullYear()}
        </span>
      </div>
    );
  }
});

module.exports = ByLine;
