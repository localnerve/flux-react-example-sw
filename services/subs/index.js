/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var data = require('../data');

// FIXME:
// Subscription storage should not be in this process in a real application.
var subscriptions = {};

/**
 * Create a new push notification subscription.
 * Initially subscribes to all topics.
 *
 * @param {String} subscriptionId - The user's subscriptionId.
 * @param {String} endpoint - The user's push service endpoint.
 * @param {Function} callback - Called on completion.
 */
function create (subscriptionId, endpoint, callback) {
  if (!subscriptionId || !endpoint) {
    return callback(new Error ('Bad subscriptionId or endpoint supplied'));
  }

  if (subscriptions[subscriptionId]) {
    return callback(new Error('subscriptionId already exists'));
  }

  data.fetch({
    resource: 'settings'
  }, function (err, data) {
    if (err) {
      return callback(err);
    }

    var topics = data.content.pushNotifications.topics.map(function (topic) {
      topic.subscribed = true;
      return topic;
    });

    subscriptions[subscriptionId] = {
      subscriptionId: subscriptionId,
      endpoint: endpoint,
      topics: topics
    };

    return callback(null, topics);
  });
}

/**
 * Read push notificaiton topics for a subscription.
 * If no subscription id supplied, return all available topics.
 *
 * @param {String} [subscriptionId] - The user's subscription ID.
 * @param {Function} callback - Called on completion.
 */
function read (subscriptionId, callback) {
  if (subscriptionId) {
    var subscription =  subscriptions[subscriptionId];

    if (!subscription) {
      return callback(new Error('No subscription found for '+subscriptionId));
    }

    return callback(null, subscriptions[subscriptionId].topics);
  }

  data.fetch({
    resource: 'settings'
  }, function (err, data) {
    if (err) {
      return callback(err);
    }

    return callback(null, data.pushNotifications.topics);
  });
}

/**
 * Update push notification topics subscribed to.
 *
 * @param {String} subscriptionId - The subscription ID of a user.
 * @param {Array} [updateTopics] - The topics to update subscription of.
 * @param {String} [endpoint] - Optional endpoint to update the subscriber to.
 * @param {Function} callback - Called on completion.
 */
function update (subscriptionId, updateTopics, endpoint, callback) {
  var subscription = subscriptions[subscriptionId];

  if (!subscription) {
    return callback(new Error('No subscription found for '+subscriptionId));
  }

  subscription.endpoint = endpoint || subscription.endpoint;

  if (updateTopics) {
    subscription.topics.forEach(function (subscribedTopic) {
      var updates = updateTopics.filter(function (updateTopic) {
        return subscribedTopic.tag === updateTopic.tag;
      });

      if (updates && updates.length > 0) {
        // first update wins.
        subscribedTopic.subscribed = updates[0].subscribed;
      }
    });
  }

  return callback(null, subscription.topics);
}

/**
 * Unsubscribe a user from push notifications.
 *
 * @param {String} subscriptionId - The subscription ID of a user.
 * @param {Function} callback - Called on completion.
 */
function unsubscribe (subscriptionId, callback) {
  if (!subscriptions[subscriptionId]) {
    return callback(new Error('No subscription found for '+subscriptionId));
  }

  delete subscriptions[subscriptionId];

  return callback();
}

/**
 * Get all subscriptions
 */
function getSubscriptions () {
  return subscriptions;
}

module.exports = {
  create: create,
  read: read,
  update: update,
  delete: unsubscribe,
  getSubscriptions: getSubscriptions
};
