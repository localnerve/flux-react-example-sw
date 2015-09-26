/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var sizeReporter = require('./sizeReporter');

var PageContainer = React.createClass({
  render: function () {
    return (
      <div className="page">
        {this.props.children}
      </div>
    );
  }
});

module.exports = sizeReporter(PageContainer, '.page', {
  reportWidth: true,
  widthCeiling: true,
  heightCeiling: true,
  heightNearest10: true
});
