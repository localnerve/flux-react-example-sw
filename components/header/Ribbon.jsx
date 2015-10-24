/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var NavLink = require('fluxible-router').NavLink;
var ModalLink = require('./ModalLink.jsx');

var Ribbon = React.createClass({
  propTypes: {
    social: React.PropTypes.object.isRequired,
    business: React.PropTypes.object.isRequired,
    settings: React.PropTypes.object.isRequired
  },

  render: function () {
    var uriTel = 'tel:+1-' + this.props.business.telephone;

    return (
      <div className="grid-row-spaced ribbon">
        <NavLink className="mail" routeName="contact">
          <span className="icon-envelop"></span>
        </NavLink>
        <a className="phone" href={uriTel}>
          <span className="icon-phone"></span>
        </a>
        <a href={this.props.social.twitter}>
          <span className="icon-twitter"></span>
        </a>
        <a href={this.props.social.github}>
          <span className="icon-github4"></span>
        </a>
        <ModalLink data={this.props.settings}>
          <span className="icon-cog"></span>
        </ModalLink>
      </div>
    );
  }
});

module.exports = Ribbon;
