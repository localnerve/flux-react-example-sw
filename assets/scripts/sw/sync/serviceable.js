/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Module to contain methods to manage serviceable requests.
 * Handles push and contact requests.
 */
/* global Promise, self */
'use strict';

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

  debug('getContactRequests', contactRequests);

  return Promise.resolve(contactRequests);
}

/**
 * Get the serviceable (latest, unqiue) push requests.
 * Adds the push requests in order to be serviced. (order important)
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
      var
        updateTopicsRequests,
        updateSubRequests = filters.latest(
          dehydratedRequests, syncable.types.push, [
          syncable.ops.updateSubscription
        ]),
        subUnsubRequests = filters.latest(
          dehydratedRequests, syncable.types.push, [
          syncable.ops.subscribe,
          syncable.ops.unsubscribe
        ]),
        actionableSubscribe = subUnsubRequests.length > 0 &&
          subUnsubRequests[0].fallback.operation === syncable.ops.subscribe,
        actionableUnsubscribe = subUnsubRequests.length > 0 &&
          subUnsubRequests[0].fallback.operation === syncable.ops.unsubscribe
        ;

      // [1] unconditionally add updateSubscription requests
      pushRequests = pushRequests.concat(updateSubRequests);

      // [2] add subscribe or unsubscribe
      if (actionableSubscribe || actionableUnsubscribe) {
        pushRequests = pushRequests.concat(subUnsubRequests);
      }

      // If not unsubscribing, then if subscribing or just actively subscribed,
      // add the latest topicUpdates unqiue by tag topic tag value.
      if (!actionableUnsubscribe && (actionableSubscribe || subscribed)) {
        updateTopicsRequests = filters.latest(
          dehydratedRequests,
          syncable.types.push,
          [syncable.ops.updateTopics],
          'tag'
        );

        // [3] add any updateTopics
        pushRequests = pushRequests.concat(updateTopicsRequests);
      }

      debug('getPushRequests', pushRequests);
      return pushRequests;
    });
  }

  debug('getPushRequests, pushManager not found');
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
    return getPushRequests(dehydratedRequests).then(function (pushes) {
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

  debug('pruneRequests', unserviceableRequests);

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
 * @see pruneRequestsByPolicy
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
    'pruneContactRequests', fallback, redundantContactRequests
  );

  return Promise.all(redundantContactRequests.map(function (request) {
    return idb.del(idb.stores.requests, request.timestamp);
  }));
};

prunePolicies[syncable.types.push] =
/**
 * Prune policy for push requests.
 * Policy: Remove all push requests, except updateSubscription.
 *
 * Called when a push operation succeeds to remove redundantPushRequests.
 * Possible success (fallback) operations: sub, unsub, updateTopics, demo.
 * Some truths/rules:
 * 0. Never remove demo operation.
 * 0.1. Never remove updateSubscription. Remember the other ops can succeed with
 * the old subscription still in place. The succcess operation (the fallback)
 * will never be updateSubscription (to this method).
 * 1. A successful unsub or sub op can allow for the deletion of all other ops -
 * except updateSub, because user does not initiate updateSub (browser does).
 * 2. A successful updateTopics means UI is in subscribed state. Prune unsub,
 * and updateTopics of same tag property.
 *
 * @see pruneRequestsByPolicy
 * @private
 *
 * @param {Array} dehydratedRequests - All stored dehydrated requests.
 * @param {Object} fallback - The fallback object of request that succeeded.
 * @param {String} fallback.operation - The operation that succeeded.
 * @param {Object} body - The body of the request that succeeded.
 * @returns {Promise} Resolves when all matched push requests are removed
 * from idb.
 */
function prunePolicyPush (dehydratedRequests, fallback, body) {
  var succeededOperation = fallback.operation;
  var redundantPushRequests = [];

  // 1.
  // If the sub/unsub succeeded, all possible redundant ops should be pruned.
  if (succeededOperation === syncable.ops.subscribe ||
      succeededOperation === syncable.ops.unsubscribe) {
    Array.prototype.push.apply(redundantPushRequests,
      filters.match(
        dehydratedRequests,
        syncable.types.push,
        Object.keys(syncable.ops)
        .filter(function (key) {
          // Filter out 'push' type operations that cannot be redundant.
          return (syncable.ops[key] !== syncable.ops.demo &&
                  syncable.ops[key] !== syncable.ops.updateSubscription);
        })
        .map(function (key) {
          return syncable.ops[key];
        })
      )
    );
  }

  // 2.
  // If updateTopics succeeded, remove unsub and updateTopics of the same tag.
  else if (succeededOperation === syncable.ops.updateTopics) {
    var successfulUpdateTopic = filters.getPropertyByName('tag', body);

    // Unsubscribes are redundant.
    Array.prototype.push.apply(redundantPushRequests,
      filters.match(
        dehydratedRequests, syncable.types.push, [syncable.ops.unsubscribe]
      )
    );

    // Duplicate topic updates are redundant.
    Array.prototype.push.apply(redundantPushRequests,
      filters.match(
        dehydratedRequests, syncable.types.push, [syncable.ops.updateTopics]
      ).filter(function (dehydratedTopicRequest) {
        var deferredUpdateTopic = filters.getPropertyByName(
          'tag', dehydratedTopicRequest
        );
        return deferredUpdateTopic === successfulUpdateTopic;
      })
    );
  }

  debug('prunePushRequests, pruning requests: ', redundantPushRequests);

  return Promise.all(redundantPushRequests.map(function (request) {
    return idb.del(idb.stores.requests, request.timestamp);
  }));
};

/**
 * Remove specific types of requests from IndexedDB by policy.
 * Uses a fallback object to identify requests that might be affected.
 * Unexpected syncable types are ignored.
 *
 * This is called when a request succeeds. It is used to trim deferred requests
 * depending on what request succeeded (success indicated in fallback).
 *
 * @see ./index.js, maintainRequests
 *
 * @param {Array} dehydratedRequests - All stored dehydrated requests.
 * @param {Object} fallback - The fallback object of the successful request.
 * @param {Object} body - The body object of successful request.
 * @returns {Promise} Resolves after prune complete.
 */
function pruneRequestsByPolicy (dehydratedRequests, fallback, body) {
  debug('prune fallback requests from database ', fallback);

  if (fallback.type in prunePolicies) {
    return prunePolicies[fallback.type].apply(prunePolicies, [
        dehydratedRequests,
        fallback,
        body
      ]
    );
  }

  debug(
    'prune policy not found for fallback type ', fallback.type
  );

  return Promise.resolve();
}

/**
 * Update all deferred push requests to use the given subscriptionId.
 *
 * @param {String} subscriptionId - The subscriptionId to update to.
 *  If falsy, no update is performed.
 * @returns {Promise} resolves to undefined when operation successfully complete.
 */
function updatePushSubscription (subscriptionId) {
  if (subscriptionId) {
    return idb.all(idb.stores.requests)
    .then(function (dehydratedRequests) {
      var allPushRequests = filters.match(
        dehydratedRequests,
        syncable.types.push, Object.keys(syncable.ops).map(function (key) {
          return syncable.ops[key];
        }));

      return Promise.all(allPushRequests.map(function (request) {
        var params = filters.getPropertyByName('params', request);

        if (params && params.subscriptionId) {
          params.subscriptionId = subscriptionId;
          return idb.put(idb.stores.requests, request.timestamp, request);
        }
        return Promise.resolve();
      }));
    });
  }
  return Promise.resolve();
}

module.exports = {
  getRequests: getRequests,
  pruneRequests: pruneRequests,
  pruneRequestsByPolicy: pruneRequestsByPolicy,
  updatePushSubscription: updatePushSubscription
};
