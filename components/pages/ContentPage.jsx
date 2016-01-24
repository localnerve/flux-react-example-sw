/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var Spinner = require('./Spinner.jsx');

var ContentPage = React.createClass({
  render: function () {
    var content = this.renderContent();

    return (
      <div className="grid-container-center page-content">
        {content}
      </div>
    );
  },
  shouldComponentUpdate: function (nextProps) {
    return this.props.content !== nextProps.content;
  },
  renderContent: function () {
    if (this.props.spinner) {
      return (
        <Spinner />
      );
    } else {
      return (
        <div key="content" dangerouslySetInnerHTML={{__html: this.props.content || ''}}>
        </div>
      );
    }
  }
});

module.exports = ContentPage;
