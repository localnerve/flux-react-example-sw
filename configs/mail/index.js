/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

function makeConfig() {
  return {
    service: 'Mandrill',
    mailTo: 'alex@localnerve.com',
    mailFrom: 'website@localnerve.com',
    transport: 'SMTP',
    subject: 'Contact Form Submission'
  };
}

module.exports = makeConfig;