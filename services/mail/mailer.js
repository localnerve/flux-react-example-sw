/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * TODO: add sanitizer
 */
'use strict';

var mailer = require('nodemailer');
var contact = require('../../configs').create().contact;

/**
 * Send mail to a well-known mail service.
 * Uses configs/contact configuration object for mail settings.
 *
 * @param {Object} payload - The mail payload
 * @param {String} payload.name - The replyTo name
 * @param {String} payload.email - The replyTo email address
 * @param {String} payload.message - The mail message body
 * @param {Function} done - The callback to execute on completion.
 */
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
