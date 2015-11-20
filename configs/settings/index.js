/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var path = require('path');
var _ = require('lodash');
var assets = require('./assets');
var utils = require('./utils');

var distbase = 'dist';
var assetsbase = 'assets';
var publicbase = '/public';

var prependPathToObject = utils.prependPathToObject;

/***
 * Directories and files that are in src, distribution, and web
 */
var commonDirs = {
  images: 'images',
  styles: 'styles',
  fonts: 'fonts',
  scripts: 'scripts'
};
var commonFiles = {
  five00: '500.html',
  five03: '503.html',
  favicon: path.join(commonDirs.images, 'favicon.ico'),
  robots: 'robots.txt',
  sitemap: 'sitemap.xml',
  headerScript: path.join(commonDirs.scripts, 'header.js'),
  appManifest: 'manifest.json',
  browserConfig: 'browserconfig.xml'
};

/***
 * Directories and files that are in both dist and web
 */
var outputDirs = {
};
var outputFiles = {
  css: {
    inline: path.join(commonDirs.styles, 'index.css'),
    other: [
      path.join(commonDirs.styles, 'settings.css')
    ]
  }
};

/***
 * Source only dirs and files
 */
var srcDirs = {
  components: 'components',
  config: 'configs',
  assets: assetsbase,
  scripts: path.join(assetsbase, commonDirs.scripts)
};
var srcFiles = {
  assetsJson: path.join(srcDirs.config, path.basename(__dirname), assets.assetsJsonFile),
  serviceWorker: {
    registration: path.join(srcDirs.scripts, 'service-worker-registration.js'),
    precache: path.join(srcDirs.scripts, 'sw', 'precache.js'),
    data: path.join(srcDirs.scripts, 'sw', 'data.js'),
    entry: path.join(srcDirs.scripts, 'sw', 'index.js')
  }
};

/**
 * Get settings to override by environment.
 * production override uses ASSET_HOST env variable.
 *
 * @param {String} env - The environment string.
 * @param {String} baseDir - The base directory.
 * @returns {Object|Undefined} The environment specific overrides or undefined if none.
 */
function overrides (env, baseDir) {
  var envOverrides = {
    production: {
      dist: {
        baseDir: path.join(baseDir, distbase, 'release')
      },
      loggerFormat: 'tiny',
      web: {
        // ssl: true,
        assetAge: 31556926000,
        assetHost: process.env.ASSET_HOST || 'flux-react-example.herokuapp.com'
      }
    }
  };
  return envOverrides[env];
}

/**
 * Make the settings configuration object.
 *
 * @param {Object} nconf - The nconfig object.
 * @returns The settings configuration object.
 */
function makeConfig (nconf) {
  var env = nconf.get('NODE_ENV');

  // Update baseDir if defined
  var baseDir = nconf.get('baseDir') || '.';

  /**
   * The exported settings config
   */
  var config = {
    dist: {
      baseDir: path.join(baseDir, distbase, 'debug')
    },
    src: {
      baseDir: baseDir
    },
    web: {
      baseDir: publicbase,
      assetAge: 0,
      assetHost: 'localhost',
      ssl: false
    },

    // unmovable project directories
    distbase: distbase,
    vendor: {
      css: 'node_modules/foundation-apps/scss'
    },

    loggerFormat: 'dev'
  };

  // Environment overrides
  _.merge(config, overrides(env, baseDir));

  // Assemble config.src
  _.assign(
    config.src,
    prependPathToObject(commonDirs, path.join(config.src.baseDir, assetsbase)),
    prependPathToObject(commonFiles, path.join(config.src.baseDir, assetsbase)),
    prependPathToObject(srcDirs, config.src.baseDir),
    prependPathToObject(srcFiles, config.src.baseDir)
  );

  // Assemble config.dist and config.web
  [config.dist, config.web].forEach(function (config) {
    _.assign(
      config,
      prependPathToObject(commonDirs, config.baseDir),
      prependPathToObject(commonFiles, config.baseDir),
      prependPathToObject(outputDirs, config.baseDir),
      prependPathToObject(outputFiles, config.baseDir)
    );
  });

  // A little extra web-only config for determining built assets
  config.web.assets = assets.assetsConfig(config.web.scripts);

  return config;
}

module.exports = makeConfig;
