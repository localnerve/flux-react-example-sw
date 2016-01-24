#!/usr/bin/env node
/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Manual test harness for mail and queue service exercise.
 *
 * PREREQUISITES:
 *  Must have environment setup for mail and queue settings, auth.
 *  Must have the services implied by those settings setup and operational.
 *   (Must have AMQP queue running and pointed to by contact.queue.url, etc.)
 *
 * Plunks a message onto the queue then starts the worker to consume it.
 * Kills the worker after some constant time elapsed.
 *
 * Must manually verify mail and queue status is as expected.
 */
/* global console, process */

var path = require('path');
var spawn = require('child_process').spawn;

var mail = require('../../../services/mail');
var contact = require('../../../configs').create().contact;

var workerProcess = '../../../server/workers/contact/bin/contact';
var workTime = 10000;

if (!contact.mail.username() || !contact.mail.password()) {
  console.error('mail service credentials missing. Check environment.');
  console.error('mail config');
  console.error('service  = ' + contact.mail.service());
  console.error('to       = ' + contact.mail.to());
  console.error('from     = ' + contact.mail.from());
  console.error('username = ' + contact.mail.username());
  console.error('password = ' + contact.mail.password());
  process.exit();
}

mail.send({
  name: 'Manual Test',
  email: 'manual@test.local',
  message: 'This is a test message from the manual test harness.'
}, function (err) {
  if (err) {
    throw err;
  }

  var cp = spawn(path.resolve(workerProcess));

  cp.on('close', function () {
    console.log(workerProcess + ' complete');
    process.exit();
  });

  setTimeout(function () {
    cp.kill('SIGINT');
  }, workTime);
});
