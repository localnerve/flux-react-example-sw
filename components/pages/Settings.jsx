/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var modalAction = require('../../actions/modal').stopModal;

var Settings = React.createClass({
  propTypes: {
    content: React.PropTypes.object.isRequired,
    models: React.PropTypes.object
  },
  contextTypes: {
    executeAction: React.PropTypes.func.isRequired
  },

  render: function () {
    return (
      <div>
        <h2>Settings</h2>
        <button onClick={this.closeModal}>
          <span>Close</span>
        </button>
      </div>
    );
  },

  closeModal: function () {
    this.context.executeAction(modalAction);
  }
});

module.exports = Settings;
