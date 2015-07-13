/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Environment specific configuration for Flux-React-Example-Data (FRED)
 *
 * Environment variables can override the following:
 *   FRED_URL - The full url to the resource manifest
 *   FRED_MEDIATYPE - The media type to Accept
 *   FRED_BRANCH - A 'ref' parameter added to the FRED_URL.
 *     For GH, this changes the commit/branch/tag to query from
 *     (default is the repo default branch)
 */
'use strict';

var qs = require('querystring');

function FRED_URL () {
  return process.env.FRED_URL ||
    'https://api.github.com/repos/localnerve/flux-react-example-data/contents/resources.json';
}

function FRED_MEDIATYPE () {
  return process.env.FRED_MEDIATYPE || 'application/vnd.github.v3+json';
}

var branches = {
  development: 'development',
  production: 'master'
};

function FRED_BRANCH (env) {
  return process.env.FRED_BRANCH || branches[env];
}

function addBranch (url, env) {
  return url +'?' + qs.stringify({ ref: FRED_BRANCH(env) });
}

function makeConfig (nconf) {
  var env = nconf.get('NODE_ENV');

  return {
    FRED: {
      url: function () {
        return addBranch(FRED_URL(), env);
      },
      mainResource: 'routes',
      mediaType: function () {
        return FRED_MEDIATYPE();
      },
      branchify: function (url) {
        return addBranch(url, env);
      }
    },
    defaults: {
      pageName: 'home'
    }
  };
}

module.exports = makeConfig;
