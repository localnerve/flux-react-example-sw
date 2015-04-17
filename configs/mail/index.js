/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Environment specific configuration for mail.
 *
 * Environment variables can override the following:
 *   MAIL_SERVICE - A string that denotes a mail service known to nodemailer, default Mandrill
 *   MAIL_USERNAME - The authenticated service user of the mail service, default MANDRILL_USERNAME from env
 *   MAIL_PASSWORD - The authenticated service pass for the mail service, default MANDRILL_PASSWORD from env
 *   MAIL_TO - The mailto of all mail messages from this app, defaults to NODE_ENV chosen headers
 *   MAIL_FROM - The mailfrom of all mail messages from this app, defaults to NODE_ENV chosen headers
 */
'use strict';

function MAIL_SERVICE () {
  return process.env.MAIL_SERVICE || 'Mandrill';
}

function MAIL_USERNAME () {
  return process.env.MAIL_USERNAME || process.env.MANDRILL_USERNAME;
}

function MAIL_PASSWORD () {
  return process.env.MAIL_PASSWORD || process.env.MANDRILL_PASSWORD;
}

var mailHeaders = {
  development: {
    mailTo: 'fred@localnerve.com',
    mailFrom: 'flux-react-example@localnerve.com'
  },
  production: {
    mailTo: 'fred@localnerve.com',
    mailFrom: 'flux-react-example@localnerve.com'
  }
};

function mailTo (env) {
  return process.env.MAIL_TO || mailHeaders[env].mailTo;
}

function mailFrom (env) {
  return process.env.MAIL_FROM || mailHeaders[env].mailFrom;
}

function makeConfig(env) {
  return {
    service: {
      name: MAIL_SERVICE,
      username: MAIL_USERNAME,
      password: MAIL_PASSWORD
    },
    mailTo: function () {
      return mailTo(env);
    },
    mailFrom: function () {
      return mailFrom(env);
    },
    transport: 'SMTP',
    subject: 'Flux-React-Example Contact Form Submission'
  };
}

module.exports = makeConfig;