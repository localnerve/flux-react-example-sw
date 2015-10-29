/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var connectToStores = require('fluxible-addons-react/connectToStores');
var modalAction = require('../../../actions/modal').closeModal;
var settingsAction = require('../../../actions/settings');
var Spinner = require('../Spinner.jsx');
var cx = require('classnames');

var Settings = React.createClass({
  propTypes: {
    failure: React.PropTypes.bool.isRequired,
    spinner: React.PropTypes.bool,
    name: React.PropTypes.string,
    heading: React.PropTypes.string,
    settingsNotSupported: React.PropTypes.string,
    pushNotifications: React.PropTypes.object,
    backgroundSync: React.PropTypes.object,
    demo: React.PropTypes.object,
    hasServiceWorker: React.PropTypes.bool,
    hasPushMessaging: React.PropTypes.bool,
    hasPermissions: React.PropTypes.bool,
    hasNotifications: React.PropTypes.bool,
    pushBlocked: React.PropTypes.bool,
    syncBlocked: React.PropTypes.bool,
    subscription: React.PropTypes.object
  },
  contextTypes: {
    executeAction: React.PropTypes.func.isRequired,
    getStore: React.PropTypes.func.isRequired
  },

  render: function () {
    if (this.props.failure) {
      return this.renderFailure();
    }

    if (this.props.spinner || !('hasServiceWorker' in this.props)) {
      return React.createElement(Spinner);
    }

    return this.renderSettings();
  },

  /**
   * Render a modal dialog failure outcome.
   * In this case, there is no prop that is reliable.
   * 500 content is preloaded by the server, so it is reliable and appropriate.
   */
  renderFailure: function () {
    var contentStore = this.context.getStore('ContentStore');
    return contentStore.get('500').content;
  },

  /**
   * Render the settings dialog contents.
   */
  renderSettings: function () {
    var hasSettings = this.props.hasServiceWorker && this.props.hasPushMessaging,
        notSupported = this.renderNotSupported(hasSettings),
        settingsControls = this.renderControls();

    return (
      <div className="settings">
        <span className="close" onClick={this.closeModal}></span>
        <h2>{this.props.heading}</h2>
        {notSupported}
        {settingsControls}
      </div>
    );
  },

  /**
   * Render a message that indicates lack of support.
   */
  renderNotSupported: function (hasSettings) {
    if (!hasSettings) {
      return (
        <h4>{this.props.settingsNotSupported}</h4>
      );
    } else {
      return null;
    }
  },

  renderControls: function () {
    var pushDisabled =
      !this.props.hasServiceWorker ||
      !this.props.hasPushMessaging ||
      this.props.pushBlocked;

    var hasSubscription = !!this.props.subscription;

    var pushNotice;
    if (!this.props.hasServiceWorker) {
      pushNotice = this.props.pushNotifications.notificationsNotSupported;
    } else if (!this.props.hasPushMessaging) {
      pushNotice = this.props.pushNotifications.pushMessagingNotSupported;
    } else if (this.props.pushBlocked) {
      pushNotice = this.props.pushNotifications.notificationsBlocked;
    }

    var pushTopics = this.renderPushTopics(pushDisabled, hasSubscription);
    var pushDemo = this.renderPushDemo(pushDisabled, hasSubscription);

    return (
      <div>
        <div className="control-section">
          <div className="switch">
            <input type="checkbox" id="push-enable"
              disabled={pushDisabled}
              checked={hasSubscription}
              onChange={this.subscriptionChange} />
            <label htmlFor="push-enable"></label>
          </div>
          <div className="switch-label">
            <span>{this.props.pushNotifications.enable}</span>
          </div>
          <div className={cx({
              hide: !pushNotice,
              notice: true
          })}>
            <small>{pushNotice}</small>
          </div>
          {pushTopics}
          {pushDemo}
        </div>
        <div className="control-section">
          <div className="switch">
            <input type="checkbox" id="background-sync-enable" disabled />
            <label htmlFor="background-sync-enable"></label>
          </div>
          <div className="switch-label">
            <span>{this.props.backgroundSync.enable}</span>
          </div>
          <div className="notice">
            <small>Background Sync not implemented yet &#x2639;</small>
          </div>
        </div>
      </div>
    );
  },

  /**
   * TODO: check subscription to get value of 'checked' for each topic.
   */
  renderPushTopics: function (pushDisabled, hasSubscription) {
    var topics = this.props.pushNotifications.topics.map(function (topic) {
      return (
        <li key={topic.tag}>
          <div className="topic-box">
            <input type="checkbox" id={topic.tag} name={topic.tag}
              checked={true} disabled={pushDisabled || !hasSubscription}
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
   * Render the push demo content.
   */
  renderPushDemo: function (pushDisabled, hasSubscription) {
    if (this.props.demo && this.props.demo.pushNotification) {
      return (
        <div className="push-demo">
          <button
            disabled={pushDisabled || !hasSubscription}
            onClick={this.pushDemo}>
            <span>Demo Push Notification</span>
          </button>
        </div>
      );
    }

    return null;
  },

  /**
   * TODO:
   * Subscribe/Unsubscribe all.
   */
  subscriptionChange: function (event) {
    // a bit of fakery for now:
    this.context.executeAction(settingsAction, {
      subscription: event.target.checked
    });
  },

  /**
   * TODO:
   * Subscribe/Unsubscribe topic.
   */
  topicChange: function (event) {
  },

  /**
   * TODO:
   * Send a push notification to the current subscription id.
   */
  pushDemo: function () {
  },

  /**
   * Closes the modal dialog.
   */
  closeModal: function () {
    this.context.executeAction(modalAction);
  }
});

Settings = connectToStores(Settings, ['SettingsStore'], function (context) {
  var settingsStore = context.getStore('SettingsStore');

  return {
    hasServiceWorker: settingsStore.getHasServiceWorker(),
    hasPushMessaging: settingsStore.getHasPushMessaging(),
    hasPermissions: settingsStore.getHasPermissions(),
    hasNotifications: settingsStore.getHasNotifications(),
    pushBlocked: settingsStore.getPushBlocked(),
    syncBlocked: settingsStore.getSyncBlocked(),
    subscription: settingsStore.getSubscription()
  };
});

module.exports = Settings;
