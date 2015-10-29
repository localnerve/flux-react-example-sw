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

  /**
   * Render the settings dialog contents.
   */
  renderSettings: function () {
    var hasSettings = this.props.hasServiceWorker && this.props.hasPushMessaging,
        notSupported = this.renderNotSupported(hasSettings),
        settingsControls = this.renderSettingsControls(),
        demoControls = this.renderDemoControls();

    return (
      <div className="settings">
        <span className="close" onClick={this.closeModal}></span>
        <h2>{this.props.heading}</h2>
        {notSupported}
        {settingsControls}
        {demoControls}
      </div>
    );
  },

  renderSettingsControls: function () {
    var pushDisabled =
      !this.props.hasServiceWorker ||
      !this.props.hasPushMessaging ||
      this.props.pushBlocked;

    var hasSubscription = !!this.props.subscription;

    var pushNotice;
    if (!this.props.hasServiceWorker) {
      pushNotice = this.props.notificationsNotSupported;
    } else if (!this.props.hasPushMessaging) {
      pushNotice = this.props.pushMessagingNotSupported;
    } else if (!this.props.blocked) {
      pushNotice = this.props.notificationsBlocked;
    }

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
          <div className={cx({ hide: !pushNotice })}>
            <small>{pushNotice}</small>
          </div>
        </div>
        <hr />
        <div className="control-section">
          <div className="switch">
            <input type="checkbox" id="background-sync-enable" disabled />
            <label htmlFor="background-sync-enable"></label>
          </div>
          <div className="switch-label">
            <span>{this.props.backgroundSync.enable}</span>
          </div>
          <div>
            <small>Background Sync is not ready yet.</small>
          </div>
        </div>
      </div>
    );
  },

  /**
   * TODO:
   * Subscribe/Unsubscribe
   * On Subscribe, show the categories
   */
  subscriptionChange: function (event) {
    // a bit of fakery for now:
    this.context.executeAction(settingsAction, {
      subscription: event.target.checked
    });
  },

  /**
   * TODO:
   */
  renderDemoControls: function (hasSettings) {
    return null;
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
