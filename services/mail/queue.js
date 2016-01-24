/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Example:Mail:Queue');
var contact = require('../../configs').create().contact;
var amqp = require('amqplib');
var mailer = require('./mailer');

/**
 * Add a mail payload to the outgoing mail queue.
 *
 * @param {Object} input - The contact mail payload.
 * @param {Function} callback - The callback to execute on completion.
 */
function sendMail (input, callback) {
  var open = amqp.connect(contact.queue.url());

  open.then(function (conn) {
    debug('AMQP connection open');

    return conn.createChannel().then(function (ch) {
      debug('AMQP channel created');

      var q = contact.queue.name();

      return ch.assertQueue(q).then(function () {
        ch.sendToQueue(q, new Buffer(JSON.stringify(input)));
        debug('AMQP message sent', input);
      });
    });
  })
  .then(callback, function (err) {
    debug('AMQP message failure', err);
    callback(err);
  });
}

/**
 * This is the main proc of the contact worker process.
 * This blocks consuming the outgoing mail queue and sends mail
 * when a message is received. SIGINT will disrupt the process.
 * If the send fails, nacks it back onto the queue.
 */
function contactWorker () {
  amqp.connect(contact.queue.url()).then(function (conn) {
    process.once('SIGINT', function () {
      conn.close();
    });

    return conn.createChannel().then(function (ch) {
      var q = contact.queue.name();

      return ch.assertQueue(q).then(function () {
        ch.consume(q, function (msg) {
          if (msg !== null) {
            mailer.send(JSON.parse(msg.content.toString()), function(err) {
              if (err) {
                debug('mailer failed to send ', msg);
                return ch.nack(msg);
              }
              debug('mailer successfully sent ', msg);
              ch.ack(msg);
            });
          }
        });
      });
    });
  }).then(null, console.warn);
}

module.exports = {
  sendMail: sendMail,
  contactWorker: contactWorker
};
