/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * TODO: populate from backend with offline worker process
 */
'use strict';

 var models = {
  "LocalBusiness": {
    "legalName": "LocalNerve, LLC",
    "alternateName": "LocalNerve",
    "url": "http://localnerve.com",
    "telephone": "207-370-8005",
    "email": "alex@localnerve.com",
    "address": {
     "streetAddress": "PO BOX 95",
     "addressRegion": "ME",
     "addressLocality": "Windham",
     "addressCountry": "USA",
     "postalCode": "04062",
     "postOfficeBoxNumber": "95"
    }
  },
  "SiteInfo": {
    "site": {
      "name": "PedalPulse",
      "tagLine": "A Fluxible, Reactive reference app with a good prognosis.",
      "bullets": ["Fluxible", "React", "Data Driven"]
    },
    "license": {
      "type": "BSD",
      "url": "https://github.com/localnerve/flux-react-example/blob/master/LICENSE.md",
      "statement": "All code licensed under LocalNerve BSD License."
    },
    "developer": {
      "name": "LocalNerve",
      "byLine": "Developed by LocalNerve",
      "url": "http://localnerve.com"
    },
    "social": {
      "github": "https://github.com/localnerve/flux-react-example",
      "twitter": "https://twitter.com/localnerve",
      "facebook": "https://facebook.com/localnerve",
      "linkedin": "https://www.linkedin.com/in/alexpaulgrant",
      "googleplus": "https://plus.google.com/118303375063449115817/"
    }
  }
};

module.exports = JSON.parse(JSON.stringify(models));
