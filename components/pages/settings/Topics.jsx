/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');

var Topics = React.createClass({
  propTypes: {
    topics: React.PropTypes.array.isRequired,
    disabled: React.PropTypes.bool.isRequired,
    onChange: React.PropTypes.func.isRequired
  },

  render: function () {
    var topics = this.props.topics.map(function (topic) {
      return (
        <li key={topic.tag}>
          <div className="topic-box">
            <input type="checkbox" id={topic.tag} name={topic.tag}
              checked={!!topic.subscribed}
              disabled={this.props.disabled}
              onChange={this.props.onChange} />
            <label htmlFor={topic.tag}></label>
          </div>
          <div className="topic-label">
            <span>{topic.label}</span>
          </div>
        </li>
      );
    }, this);

    return (
      <ul className="topics-list">
        {topics}
      </ul>
    );
  }
});

module.exports = Topics;
