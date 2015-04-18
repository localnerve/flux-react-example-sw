/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var mailer = require('nodemailer');
var contact = require('../../configs').create().get('contact');

// TODO: add sanitizer

function send (payload, done) {
  var transport = mailer.createTransport({
    service: contact.mail.service(),
    auth: {
      user: contact.mail.username(),
      pass: contact.mail.password()
    }
  });

  transport.sendMail({
    from: contact.mail.from(),
    to: contact.mail.to(),
    replyTo: payload.name + ' <' + payload.email + '>',
    subject: contact.mail.subject,
    text: payload.message
  }, done);
}

module.exports = {
  send: send
};