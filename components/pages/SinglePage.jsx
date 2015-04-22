/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');

var SinglePage = React.createClass({
  render: function() {
    return (
      <div className="page">
        <div className="grid-container-center page-content"
          dangerouslySetInnerHTML={{__html: this.props.content || ''}}>
        </div>
      </div>
    );
  }
});

module.exports = SinglePage;
