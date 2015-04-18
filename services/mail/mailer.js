/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var mailer = require('nodemailer');
var config = require('../../configs').create().get('mail');

// TODO: add sanitizer

function send (payload, done) {
  var transport = mailer.createTransport({
    service: config.mail.service(),
    auth: {
      user: config.mail.username(),
      pass: config.mail.password()
    }
  });

  transport.sendMail({
    from: config.mail.from(),
    to: config.mail.to(),
    replyTo: payload.name + ' <' + payload.email + '>',
    subject: config.mail.subject,
    text: payload.message
  }, done);
}

module.exports = {
  send: send
};