/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Environment specific configuration for mail.
 *
 * Environment variables can override the following:
 *   MAIL_SERVICE - A string that denotes a mail service known to nodemailer, default Mandrill
 *   MAIL_USERNAME - The authenticated service user of the mail service, default MANDRILL_USERNAME from env
 *   MAIL_PASSWORD - The authenticated service pass for the mail service, default MANDRILL_APIKEY from env
 *   MAIL_TO - The mailto of all mail messages from this app, defaults to NODE_ENV chosen headers
 *   MAIL_FROM - The mailfrom of all mail messages from this app, defaults to NODE_ENV chosen headers
 *   QUEUE_NAME - The name of the outgoing mail queue, defaults to 'outgoing-mail'
 *   QUEUE_URL - The url of the queue service, defaults to NODE_ENV chosen url
 */
'use strict';

// For now, just supporting well known services
function MAIL_SERVICE () {
  return process.env.MAIL_SERVICE || 'Mandrill';
}

function MAIL_USERNAME () {
  return process.env.MAIL_USERNAME || process.env.MANDRILL_USERNAME;
}

function MAIL_PASSWORD () {
  return process.env.MAIL_PASSWORD || process.env.MANDRILL_APIKEY;
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

function QUEUE_NAME () {
  return process.env.QUEUE_NAME || 'outgoing-mail';
}

var mailQueue = {
  development: 'amqp://localhost',
  production: process.env.CLOUDAMQP_URL
};

function QUEUE_URL (env) {
  return process.env.QUEUE_URL || mailQueue[env];
}

function makeConfig(env) {
  return {
    mail: {
      service: MAIL_SERVICE,
      username: MAIL_USERNAME,
      password: MAIL_PASSWORD,
      to: function () {
        return mailTo(env);
      },
      from: function () {
        return mailFrom(env);
      },
      subject: 'Flux-React-Example Contact Form Submission'
    },
    queue: {
      name: QUEUE_NAME,
      url: function () {
        return QUEUE_URL(env);
      }
    }
  };
}

module.exports = makeConfig;