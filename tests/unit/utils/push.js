/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global describe, it */
'use strict';

var expect = require('chai').expect;

var push = require('../../../utils/push');

describe('push', function () {
  it('should expose getSubscriptionId', function () {
    expect(push).to.respondTo('getSubscriptionId');
  });

  describe('getSubscriptionId', function () {
    var subId = '1234',
        subId2 = '5678',
        endpoint = 'http://endpoint/'+subId2;

    it('should return null if falsy subscription supplied', function () {
      expect(push.getSubscriptionId()).to.be.null;
    });

    it('should return subscriptionId if subscription has one', function () {
      expect(push.getSubscriptionId({
        subscriptionId: subId,
        endpoint: endpoint
      })).to.equal(subId);
    });

    it('should return subscriptionId from endpoint if no subId', function () {
      expect(push.getSubscriptionId({
        endpoint: endpoint
      })).to.equal(subId2);
    });
  });
});
