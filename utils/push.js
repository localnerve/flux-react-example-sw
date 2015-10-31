/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

/**
 * Consistent method for returning a subscription id for a pushSubscription.
 *
 * @param {Object} subscription - The pushSubscription object.
 * @returns {String} The subscription id, null if no subscription supplied.
 */
function getSubscriptionId (subscription) {
  if (!subscription) {
    return null;
  }

  var subscriptionId = subscription.subscriptionId;

  if (!subscriptionId && typeof subscription.getKey === 'function') {
    subscriptionId = subscription.getKey();
  }

  if (!subscriptionId) {
    var endpointSections = subscription.endpoint.split('/');
    subscriptionId = endpointSections[endpointSections.length - 1];
  }

  return subscriptionId;
}

module.exports = {
  getSubscriptionId: getSubscriptionId
};
