/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var debug = require('debug')('Example:Mail:Queue');
var config = require('../../configs').create().get('mail');
var amqp = require('amqplib');
var mailer = require('./mailer');

function sendMail (input, callback) {
  var open = amqp.connect(config.queue.url());

  open.then(function (conn) {
    debug('AMQP connection open');

    return conn.createChannel().then(function (ch) {
      debug('AMQP channel created');

      var q = config.queue.name();
      ch.assertQueue(q);
      ch.sendToQueue(q, new Buffer(JSON.stringify(input)));
      debug('AMQP message sent', input);
    });
  })
  .then(callback, function (err) {
    debug('AMQP message failure', err);
    callback(err);
  });
}

function mailService () {
  amqp.connect(config.queue.url()).then(function (conn) {
    process.once('SIGINT', function () {
      conn.close();
    });

    return conn.createChannel().then(function (ch) {
      var q = config.queue.name();
      
      ch.assertQueue(q).then(function () {
        ch.prefetch(1);

        ch.consume(q, function (msg) {
          if (msg !== null) {
            mailer.send(JSON.parse(msg.content.toString()), function(err) {
              if (err) {
                return ch.nack(msg);
              }
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
  mailService: mailService
};