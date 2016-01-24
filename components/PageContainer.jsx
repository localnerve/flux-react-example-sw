/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var sizeReporter = require('./sizeReporter');
var Notification = require('./Notification.jsx');

var PageContainer = React.createClass({
  render: function () {
    return (
      <div className="page">
        {this.props.children}
        <Notification />
      </div>
    );
  }
});

module.exports = sizeReporter(PageContainer, '.page', {
  reportWidth: true,
  reportHeight: true,
  cover: {
    height: 10
  }
});
