/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var debug = require('debug')('Settings');
var connectToStores = require('fluxible-addons-react/connectToStores');

var modalAction = require('../../../actions/modal').closeModal;
var subscribeAction = require('../../../actions/push').subscribe;
var unsubscribeAction = require('../../../actions/push').unsubscribe;
var sendAction = require('../../../actions/push').demoSend;

var Spinner = require('../Spinner.jsx');
var ContentPage = require('../ContentPage.jsx');
var PushTopics = require('./PushTopics.jsx');
var Switch = require('./Switch.jsx');

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
    pushSubscription: React.PropTypes.object,
    pushTopics: React.PropTypes.array
  },
  contextTypes: {
    executeAction: React.PropTypes.func.isRequired,
    getStore: React.PropTypes.func.isRequired
  },

  render: function () {
    if (!this.props.failure &&
        this.props.spinner || !('hasServiceWorker' in this.props)) {
      return React.createElement(Spinner);
    }

    return this.renderSettings(this.props.failure);
  },

  /**
   * Render the settings dialog contents.
   *
   * @param {Boolean} failure - Modal dialog failure outcome.
   */
  renderSettings: function (failure) {
    var failureElement = failure ? this.renderFailure() : null,
        hasSettings = !failure && this.props.hasServiceWorker && this.props.hasPushMessaging,
        notSupported = !hasSettings ? this.renderNotSupported() : null,
        settingsControls = failure ? null : this.renderControls();

    return (
      <div className="settings">
        <span className="close" onClick={this.closeModal}></span>
        <h2>{this.props.heading || 'Error'}</h2>
        {failureElement}
        {notSupported}
        {settingsControls}
      </div>
    );
  },

  /**
   * Render a modal dialog failure outcome.
   * In this case, there is no prop that is reliable.
   * 500 content is appropriate here. It is preloaded by the server,
   * so it is reliable.
   */
  renderFailure: function () {
    var contentStore = this.context.getStore('ContentStore');
    return React.createElement(ContentPage, {
      content: contentStore.get('500').content
    });
  },

  /**
   * Render a message that indicates lack of support.
   */
  renderNotSupported: function (hasSettings) {
    return (
      <h4>{this.props.settingsNotSupported}</h4>
    );
  },

  /**
   * Render the settings controls.
   */
  renderControls: function () {
    var pushDisabled =
      !this.props.hasServiceWorker ||
      !this.props.hasPushMessaging ||
      this.props.pushBlocked;

    var hasSubscription = !!this.props.pushSubscription;

    var pushNotice;
    if (!this.props.hasServiceWorker) {
      pushNotice = this.props.pushNotifications.notificationsNotSupported;
    } else if (!this.props.hasPushMessaging) {
      pushNotice = this.props.pushNotifications.pushMessagingNotSupported;
    } else if (this.props.pushBlocked) {
      pushNotice = this.props.pushNotifications.notificationsBlocked;
    }

    var pushDemo = this.renderPushDemo(pushDisabled, hasSubscription);

    return (
      <div>
        <div className="control-section">
          <Switch inputId="push-enable"
            disabled={pushDisabled}
            checked={hasSubscription}
            onChange={this.subscriptionChange}
            label={this.props.pushNotifications.enable}
            notice={pushNotice} />
          <PushTopics
            failure={this.props.failure}
            topics={this.props.pushTopics || this.props.pushNotifications.topics}
            disabled={pushDisabled || !hasSubscription}
            subscription={this.props.pushSubscription} />
          {pushDemo}
        </div>
        <div className="control-section">
          <Switch inputId="background-sync-enable"
            disabled={true}
            checked={false}
            onChange={function () {}}
            label={this.props.backgroundSync.enable}
            notice='Background Sync not implemented yet &#x2639;' />
        </div>
      </div>
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
   * Subscribe/Unsubscribe all.
   */
  subscriptionChange: function (event) {
    var action = event.target.checked ? subscribeAction : unsubscribeAction;
    this.context.executeAction(action);
  },

  /**
   * Send a push notification to the current subscription id.
   */
  pushDemo: function (event) {
    debug('demo push notification handler');

    event.currentTarget.blur();

    this.context.executeAction(sendAction, {
      subscription: this.props.pushSubscription
    });
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
    pushSubscription: settingsStore.getPushSubscription(),
    pushTopics: settingsStore.getPushTopics()
  };
});

module.exports = Settings;
