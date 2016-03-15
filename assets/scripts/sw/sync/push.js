/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Synchronize push subscription.
 */
/* global Promise, fetch */
'use strict';

var sync = require('./index');
var serviceable = require('./serviceable');
var debug = require('../utils/debug')('sync.push');
var idb = require('../utils/idb');
var requestLib = require('../utils/requests');
var syncable = require('../../../../utils/syncable');

var subscriptionService = '/_api';

/**
 * Synchronize the given subscriptionId with IndexedDB and subscription
 * service.
 *
 * If no subscriptionId stored, store the subscriptionId.
 * If the given subscriptionId is different than stored, update storage and
 *   subscription service.
 * If no change, no action performed.
 *
 * TODO: implement callers. Idea:
 * immediately call from message handler.
 * call message handler from utils/push.getSubscriptionId w/context
 * messenger.
 * call message handler from onpushsubscriptionchange.
 *
 * @param {String} subscriptionId - The new or existing subscriptionId.
 * @returns {Promise}
 */
function synchronizePushSubscription (subscriptionId) {
  var apiInfo, requestState, existingId;

  debug('synchronize push subscription', subscriptionId);

  return idb.get(idb.stores.subscription, 'id')
  .then(function (existingSubscriptionId) {
    existingId = existingSubscriptionId;

    if (existingId && subscriptionId !== existingId) {
      debug('reading init.apis');

      return idb.get(idb.stores.init, 'apis').then(function (apis) {
        apiInfo = apis[subscriptionService];
        if (apiInfo) {
          return apiInfo;
        }
        throw new Error('subscription service api info not found');
      });
    }
  })
  .then(function () {
    if (apiInfo) {
      // Would be great to create the body using fetchr itself.
      requestState = {
        url: apiInfo.xhrPath,
        method: 'POST',
        bodyType: 'json',
        body: {
          context: apiInfo.xhrContext,
          requests: {
            g0: {
              body: {},
              operation: 'update',
              params: {
                subscriptionId: existingId,
                newId: subscriptionId
              },
              resource: 'subscription'
            }
          }
        }
      };

      return fetch(requestLib.rehydrateRequest(requestState, apiInfo));
    }
  })
  .then(function (resp) {
    var response = resp || {};
    var updateSubscriptionId = !existingId || response.ok;

    // If subscription not found or service successfully updated, update
    // subscriptionId in IndexedDB.
    if (updateSubscriptionId) {
      return Promise.all([
        serviceable.updatePushSubscription(response.ok && subscriptionId),
        idb.put(idb.stores.subscription, 'id', subscriptionId)
      ])
      .then(function () {
        debug('successfully updated subscriptionId');
      });
    }

    if (response.ok === false) {
      debug('fetch failed (' + response.status + '), ' + response.statusText);

      // Add syncable property to body
      requestState.body = syncable.push(
        requestState.body,
        subscriptionId,
        syncable.ops.updateSubscription
      );

      return sync.deferRequest(
        subscriptionService,
        requestLib.rehydrateRequest(requestState, apiInfo)
      );
    }
  })
  .catch(function (error) {
    debug('synchronize failed', error);
    // TODO: What should really happen here, if anything?
    // (think about the source callers - onpushsubscriptionchange and getSubscriptionId)
    throw error;
  });
}

module.exports = {
  synchronize: synchronizePushSubscription
};
