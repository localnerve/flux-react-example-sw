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
    links: React.PropTypes.object.isRequired
  },

  render: function () {
    var selected = this.props.selected,
        links = this.props.links,
        linkHTML = Object.keys(links).map(function (name) {
          var link = links[name];
          return (
            <li
              className={cx({
                'navigation-link': true,
                selected: selected === name
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
  reportTop: true
});
