/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var NavLink = require('fluxible-router').NavLink;
var sizeReporter = require('../sizeReporter');
var cx = require('classnames');

var Nav = React.createClass({
  propTypes: {
    selected: React.PropTypes.string.isRequired,
    links: React.PropTypes.array.isRequired
  },

  render: function () {
    var selected = this.props.selected,
        links = this.props.links,
        linkHTML = links.map(function (link) {
          return (
            <li
              className={cx({
                'navigation-link': true,
                selected: selected === link.page
              })}
              key={link.path}>
              <NavLink routeName={link.page}>{link.label}</NavLink>
            </li>
          );
        });
    return (
      <ul className="grid-row-spaced navigation">
        {linkHTML}
      </ul>
    );
  }
});

module.exports = sizeReporter(Nav, '.navigation', {
  reportTop: true,
  reportHeight: true,
  cover: {
    top: 5,
    height: 10
  }
});
