/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var NavLink = require('flux-router-component').NavLink;

var Ribbon = React.createClass({
  render: function() {
    var uriTel = 'tel:+1-' + this.props.business.telephone;

    return (
      <div className="grid-row-spaced ribbon">
        <div className="grid-row-spaced contact">
          <NavLink className="mail" routeName="contact">
            <span className="icon-envelop">
            </span>
          </NavLink>
          <a className="phone" href={uriTel}>
            <span className="icon-phone">
            </span>
          </a>
        </div>
        <div className="grid-row-spaced social">
          <a href={this.props.social.twitter}>
            <span className="icon-twitter"></span>
          </a>
          <a href={this.props.social.github}>
            <span className="icon-github4"></span>
          </a>
        </div>
      </div>
    );
  }
});

module.exports = Ribbon;
