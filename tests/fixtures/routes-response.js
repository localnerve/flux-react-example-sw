/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * TODO: populate from backend with offline worker process
 */
'use strict';

var routesResponse = {
  "404": {
    "path": "/404",
    "method": "get",
    "page": "404",
    "label": "Not Found",
    "component": "SinglePage",
    "mainNav": false,
    "background": "",
    "order": 0,
    "priority": 0,
    "action": {
      "name": "page",
      "params": {
        "resource": "404",
        "url": "https://api.github.com/repos/localnerve/flux-react-example-data/contents/pages/404.md",
        "format": "markdown",
        "models": [
          "LocalBusiness",
          "SiteInfo"
        ],
        "pageTitle": "Page Not Found"
      }
    }
  },
  "500": {
    "path": "/500",
    "method": "get",
    "page": "500",
    "label": "Error",
    "component": "SinglePage",
    "mainNav": false,
    "background": "",
    "order": 0,
    "priority": 0,
    "action": {
      "name": "page",
      "params": {
        "resource": "500",
        "url": "https://api.github.com/repos/localnerve/flux-react-example-data/contents/pages/500.md",
        "format": "markdown",
        "models": [
          "LocalBusiness",
          "SiteInfo"
        ],
        "pageTitle": "Application Error"
      }
    }
  },
  "home": {
    "path": "/",
    "method": "get",
    "page": "home",
    "label": "Home",
    "component": "SinglePage",
    "mainNav": true,
    "background": "3",
    "order": 0,
    "priority": 1,
    "action": {
      "name": "page",
      "params": {
        "resource": "home",
        "url": "https://api.github.com/repos/localnerve/flux-react-example-data/contents/pages/home.md",
        "format": "markdown",
        "models": [
          "LocalBusiness",
          "SiteInfo"
        ],
        "pageTitle": "An Example Isomorphic Application"
      }
    }
  },
  "about": {
    "path": "/about",
    "method": "get",
    "page": "about",
    "label": "About",
    "component": "SinglePage",
    "mainNav": true,
    "background": "4",
    "order": 1,
    "priority": 1,
    "action": {
      "name": "page",
      "params": {
        "resource": "about",
        "url": "https://api.github.com/repos/localnerve/flux-react-example-data/contents/pages/about.md",
        "format": "markdown",
        "models": [
          "LocalBusiness",
          "SiteInfo"
        ],
        "pageTitle": "About"
      }
    }
  },
  "contact": {
    "path": "/contact",
    "method": "get",
    "page": "contact",
    "label": "Contact",
    "component": "Contact",
    "mainNav": true,
    "background": "5",
    "order": 2,
    "priority": 1,
    "action": {
      "name": "page",
      "params": {
        "resource": "contact",
        "url": "https://api.github.com/repos/localnerve/flux-react-example-data/contents/pages/contact.json",
        "format": "json",
        "models": [
          "LocalBusiness",
          "SiteInfo"
        ],
        "pageTitle": "Contact"
      }
    }
  }
};

module.exports = JSON.parse(JSON.stringify(routesResponse));
