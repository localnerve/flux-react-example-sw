/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var ReactSpinner = require('react-spinner');

var Spinner = React.createClass({
  render: function () {
    return (
      <div style={{width: '100%', marginTop: '40%'}} key="spinner">
        <ReactSpinner barColor="#43A047" width="128px" height="128px" />
      </div>
    );
  }
});

module.exports = Spinner;
