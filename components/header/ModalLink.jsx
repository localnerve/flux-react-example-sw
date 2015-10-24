/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var modalAction = require('../../actions/modal').startModal;

var ModalLink = React.createClass({
  propTypes: {
    data: React.PropTypes.object.isRequired
  },
  contextTypes: {
    executeAction: React.PropTypes.func.isRequired
  },

  render: function () {
    return (
      <a onClick={this.clickHandler}>
        {this.props.children}
      </a>
    );
  },

  clickHandler: function () {
    this.context.executeAction(modalAction, this.props.data);
  }
});

module.exports = ModalLink;
