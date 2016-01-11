/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Module to contain methods to manage serviceable requests.
 * Handles push and contact requests.
 *
 * TODO: #34 Add support for servicing deferred subscription update requests.
 */
/* global Promise, self */
'use strict';

var toolbox = require('sw-toolbox');
var filters = require('./filters');
var debug = require('../utils/debug')('serviceable');
var idb = require('../utils/idb');
var syncable = require('../../../../utils/syncable');

/**
 * Get the serviceable (latest, unique) contact requests.
 *
 * @private
 *
 * @param {Array} dehydratedRequests - All of the stored dehydratedRequests.
 * @returns {Promise} Resolves to array of serviceable contact requests.
 */
function getContactRequests (dehydratedRequests) {
  var contactRequests = filters.latest(
    dehydratedRequests, syncable.types.contact, [syncable.ops.contact]
  );

  debug(toolbox.options, 'getContactRequests', contactRequests);

  return Promise.resolve(contactRequests);
}

/**
 * Get the serviceable (latest, unqiue) push requests.
 *
 * TODO: Support subscription id updates (#34). This assumes there will be only
 * one unique subscriptionId stored. This can continue to be true, but #34 has
 * to be addressed.
 *
 * @private
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

      // [1] add subscribe or unsubscribe
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

        // [2] add any updateTopics
        pushRequests.push(updateTopicsRequests);
      }

      debug(toolbox.options, 'getPushRequests', pushRequests);
      return pushRequests;
    });
  }

  debug(toolbox.options, 'getPushRequests, pushManager not found');
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
 * @param {Array} dehydratedRequests - All stored dehydrated requests.
 * @param {Array} serviceableRequests - All serviceable dehydrated requests.
 * @returns {Promise} Resolves when all non-serviceable requests are removed
 * from idb.
 */
function pruneRequests (dehydratedRequests, serviceableRequests) {
  var unserviceableRequests = filters.without(
    dehydratedRequests, serviceableRequests
  );

  debug(toolbox.options, 'pruneRequests', unserviceableRequests);

  return Promise.all(unserviceableRequests.map(function (request) {
    return idb.del(idb.stores.requests, request.timestamp);
  }));
}

/***
 * Prune policies keyed by syncable type.
 *
 * @private
 */
var prunePolicies = {};

prunePolicies[syncable.types.contact] =
/**
 * Prune policy for contact requests.
 * Policy: Remove any prior contact requests that match fallback.key.
 *
 * @private
 *
 * @param {Array} dehydratedRequests - All stored dehydrated requests.
 * @param {Object} fallback - A fallback object.
 * @param {String} fallback.key - The key used to identify the contact request.
 * @returns {Promise} Resolves when all matched contact requests are removed
 * from idb.
 */
function prunePolicyContact (dehydratedRequests, fallback) {
  var redundantContactRequests = filters.match(
    dehydratedRequests, syncable.types.contact, [syncable.ops.contact],
    fallback.key
  );

  debug(
    toolbox.options, 'pruneContactRequests', fallback, redundantContactRequests
  );

  return Promise.all(redundantContactRequests.map(function (request) {
    return idb.del(idb.stores.requests, request.timestamp);
  }));
};

prunePolicies[syncable.types.push] =
/**
 * Prune policy for push requests.
 * For now, just removes all push requests (given fallback is ignored).
 *
 * TODO:
 * There are subtleties with updateTopics and updateSubscription (#34) that
 * have not been addressed.
 *
 * @private
 *
 * @param {Array} dehydratedRequests - All stored dehydrated requests.
 * @returns {Promise} Resolves when all matched push requests are removed
 * from idb.
 */
function prunePolicyPush (dehydratedRequests) {
  // All operations, but used with push type to restrict to push only.
  // MAYBE this should only be for subscribe/unsubscribe (not updateTopics).
  // TODO: revisit during implementation of #34 (update subscription).
  var operations = Object.keys(syncable.ops).map(function (key) {
    syncable.ops[key];
  });

  var redundantPushRequests = filters.match(
    dehydratedRequests, syncable.types.push, operations
  );

  debug(toolbox.options, 'prunePushRequests', redundantPushRequests);

  return Promise.all(redundantPushRequests.map(function (request) {
    return idb.del(idb.stores.requests, request.timestamp);
  }));
};

/**
 * Remove specific types of requests from IndexedDB by policy.
 * Uses a fallback object to identify requests that might be affected.
 * Unexpected syncable types are ignored.
 *
 * @param {Array} dehydratedRequests - All stored dehydrated requests.
 * @param {Object} fallback - A fallback object.
 * @returns {Promise} Resolves after prune complete.
 */
function pruneRequestsByPolicy (dehydratedRequests, fallback) {
  debug(toolbox.options, 'prune fallback requests from database ', fallback);

  if (fallback.type in prunePolicies) {
    return prunePolicies[fallback.type].apply(prunePolicies, [
        dehydratedRequests,
        fallback
      ]
    );
  }

  debug(
    toolbox.options, 'prune policy not found for fallback type ', fallback.type
  );

  return Promise.resolve();
}

module.exports = {
  getRequests: getRequests,
  pruneRequests: pruneRequests,
  pruneRequestsByPolicy: pruneRequestsByPolicy
};
