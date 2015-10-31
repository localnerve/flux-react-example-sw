/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var debug = require('debug')('Topics');
var pushAction = require('../../../actions/push').updateTopics;
var getSubscriptionId = require('../../../utils').getSubscriptionId;

var PushTopics = React.createClass({
  propTypes: {
    failure: React.PropTypes.bool.isRequired,
    topics: React.PropTypes.array.isRequired,
    disabled: React.PropTypes.bool.isRequired,
    subscription: React.PropTypes.object
  },
  contextTypes: {
    executeAction: React.PropTypes.func.isRequired
  },

  render: function () {
    if (this.props.failure) {
      return null;
    }
    return this.renderPushTopics();
  },

  renderPushTopics: function () {
    var topics = this.props.topics.map(function (topic) {
      return (
        <li key={topic.tag}>
          <div className="topic-box">
            <input type="checkbox" id={topic.tag} name={topic.tag}
              checked={!!topic.subscribed}
              disabled={this.props.disabled}
              onChange={this.topicChange} />
            <label htmlFor={topic.tag}></label>
          </div>
          <div className="topic-label">
            <span>{topic.label}</span>
          </div>
        </li>
      );
    }, this);

    return (
      <ul className="push-topics">
        {topics}
      </ul>
    );
  },

  /**
   * Subscribe/Unsubscribe from a push topic.
   *
   * @param {Object} event - The synthetic checkbox event.
   */
  topicChange: function (event) {
    debug('update topic ', event.target.name, event.target.checked);

    this.context.executeAction(pushAction, {
      subscriptionId: getSubscriptionId(this.props.subscription),
      endpoint: this.props.subscription.endpoint,
      topics: [{
        tag: event.target.name,
        subscribed: event.target.checked
      }]
    });
  }
});

module.exports = PushTopics;
