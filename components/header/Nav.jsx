/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var React = require('react');
var NavLink = require('flux-router-component').NavLink;

var Nav = React.createClass({
  propTypes: {
    selected: React.PropTypes.string,
    links: React.PropTypes.object
  },

  getDefaultProps: function () {
    return {
      selected: 'home',
      links: {}
    };
  },

  render: function() {
    var selected = this.props.selected,
        links = this.props.links,
        linkHTML = Object.keys(links).map(function (name) {
          var className = '', link = links[name];
            if (selected === name) {
              className = 'selected';
            }
            return (
              <li className={className} key={link.path}>
                <NavLink routeName={link.page}>{link.label}</NavLink>
              </li>
            );
        });
    return (
      <ul className="navigation">
        {linkHTML}
      </ul>
    );
  }
});

module.exports = Nav;