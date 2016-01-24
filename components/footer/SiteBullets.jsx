/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');

var SiteBullets = React.createClass({
  propTypes: {
    items: React.PropTypes.array.isRequired
  },

  render: function () {
    var items = this.props.items.map(function (item, index, arr) {
      var bullet = index < (arr.length - 1) ?
          <span>&nbsp;&bull;&nbsp;</span> : <span></span>;

      return (
        <span key={'bullet'+index}>{item}{bullet}</span>
      );
    });

    return (
      <div className="grid-row-spaced att-line footer-line">
        <span>
          {items}
        </span>
      </div>
    );
  }
});

module.exports = SiteBullets;
