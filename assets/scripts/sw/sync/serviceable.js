/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Module to contain methods to manage serviceable requests.
 *
 * TODO: #34 Add support for servicing deferred subscription update requests.
 */
/* global Promise, self */
'use strict';

var filters = require('./filters');
var idb = require('../utils/idb');
var syncable = require('../../../../utils/syncable');

/**
 * Get the latest unique contact requests.
 *
 * @param {Array} dehydratedRequests - All of the stored dehydratedRequests.
 * @returns {Promise} Resolves to array of serviceable contact requests.
 */
function getContactRequests (dehydratedRequests) {
  return Promise.resolve(
    filters.latest(dehydratedRequests, syncable.types.contact, [
      syncable.ops.contact
    ])
  );
}

/**
 * Get the latest unqiue push requests.
 *
 * TODO: #34 support subscription id updates. This assumes there will be only
 * one unique subscriptionId stored. This can continue to be true, but #34 has
 * to be addressed.
 *
 * @param {Array} dehydratedRequests - All of the stored dehydratedRequests.
 * @returns {Promise} Resolves to array of serviceable push requests.
 */
function getPushRequests (dehydratedRequests) {
  var pushRequests = [];

  if ('pushManager' in self.registration) {
    return self.registration.pushManager.getSubscription()
    .then(function (subscribed) {
      var requests = filters.latest(dehydratedRequests, syncable.types.push, [
        syncable.ops.subscribe,
        syncable.ops.unsubscribe
      ]);

      var actionableSubscribe = requests.length > 0 &&
        requests[0].fallback.operation === syncable.ops.subscribe &&
        !subscribed;

      var actionableUnsubscribe = requests.length > 0 &&
        requests[0].fallback.operation === syncable.ops.unsubscribe &&
        subscribed;

      if (actionableSubscribe || actionableUnsubscribe) {
        pushRequests.push(requests);
      }

      // If not unsubscribing, then if subscribing or just actively subscribed,
      // add the latest topicUpdates unqiue by tag topic tag value.
      if (!actionableUnsubscribe && (actionableSubscribe || subscribed)) {
        var updateTopicsRequests = filters.latest(
          dehydratedRequests,
          syncable.types.push,
          [syncable.ops.updateTopics],
          'tag'
        );

        pushRequests.push(updateTopicsRequests);
      }

      return pushRequests;
    });
  }

  return Promise.resolve(pushRequests);
}

/**
 * Get all requests eligible for service.
 *
 * @param {Array} dehydratedRequests - All stored dehydrated requests.
 * @returns {Promise} Resolves to an array of all eligible contact and push
 * requests.
 */
function getRequests (dehydratedRequests) {
  return getContactRequests(dehydratedRequests).then(function (contacts) {
    getPushRequests(dehydratedRequests).then(function (pushes) {
      return contacts.concat(pushes);
    });
  });
}

/**
 * Remove all the unserviceable requests from the database.
 *
 * @param {Array} dehydratedRequests - All stored dyhydrated requests.
 * @param {Array} serviceableRequests - All serviceable dehydrated requests.
 * @returns {Promise} Resolves when all non-serviceable requests are removed
 * from idb.
 */
function pruneRequests (dehydratedRequests, serviceableRequests) {
  var requestsToDiscard =
    filters.without(dehydratedRequests, serviceableRequests);

  return Promise.all(requestsToDiscard.map(function (request) {
    return idb.del(idb.stores.requests, request.timestamp);
  }));
}

module.exports = {
  getRequests: getRequests,
  pruneRequests: pruneRequests
};
