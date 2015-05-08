/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');

var LocalBusiness = React.createClass({
  render: function () {
    var uriMailTo = 'mailto:' + this.props.business.email;
    var uriTel = 'tel:+1-' + this.props.business.telephone;

    return (
      <div itemScope itemType="http://schema.org/LocalBusiness">
        <div className="lbiz-block">
          <span className="lbiz-element lbiz-item" itemProp="name">
            {this.props.business.legalName}
          </span>
          <div itemProp="address" itemScope="" itemType="http://schema.org/PostalAddress">
            <span className="lbiz-element lbiz-item" itemProp="streetAddress">
              {this.props.business.address.streetAddress}
            </span>
            <div className="lbiz-item">
              <span className="lbiz-element" itemProp="addressLocality">
                {this.props.business.address.addressLocality}
              </span>
              ,&nbsp;
              <span className="lbiz-element" itemProp="addressRegion">
                {this.props.business.address.addressRegion}
              </span>
              &nbsp;
              <span className="lbiz-element" itemProp="postalCode">
                {this.props.business.address.postalCode}
              </span>
            </div>
          </div>
        </div>
        <div className="lbiz-block">
          <a className="lbiz-item" href={uriMailTo}>
            <span className="lbiz-element" itemProp="email">
              {this.props.business.email}
            </span>
          </a>
        </div>
        <div className="lbiz-block">
          <a className="lbiz-item" href={uriTel}>
            <span className="lbiz-element" itemProp="telephone">
              {this.props.business.telephone}
            </span>
          </a>
        </div>
      </div>
    );
  }
});

module.exports = LocalBusiness;
