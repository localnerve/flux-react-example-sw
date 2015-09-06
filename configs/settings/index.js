/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var path = require('path');
var _ = require('lodash');

var assetsJsonFile = './assets.json';
var distbase = 'dist';
var assetsbase = 'assets';
var publicbase = '/public';

/**
 * Prepends a path to object values.
 * Returns a new object result.
 * If a property value is not a String, it is passed along by reference unaffected.
 *
 * @param {Object} fromObj - The object whose String properties are to have paths prepended to them.
 * @param {String} prePath - The path to prepend.
 * @returns {Object} A fromObject copy with the given path prepended to the String values.
 */
function prependPathToObject (fromObj, prePath) {
  return Object.keys(fromObj).reduce(function (obj, key) {
    var fromValue = fromObj[key];
    if (typeof fromValue === 'string') {
      obj[key] = path.join(prePath, fromValue);
    } else if (typeof fromValue === 'object') {
      obj[key] = prependPathToObject(fromValue, prePath);
    } else {
      obj[key] = fromValue;
    }
    return obj;
  }, {});
}

/**
 * Creates a configuration for loading and decorating assets json at a later time.
 * Assets json comes from webpack stats, generated by the build.
 *
 * @param {String} baseDir - The base directory on which to join asset paths.
 * @returns {Object} The Config object used to load assets json and reference assets.
 */
function assetsConfig (baseDir) {
  /**
   * Creates Config Object
   *
   * @class
   * @param {String} dir - The base directory on which to join asset paths.
   */
  function Config (dir) {
    this.baseDir = dir;
  }

  Config.prototype = {
    /**
     * Loads assets.json file
     *
     * @returns {Object} A reference to the object instance for chainability.
     */
    load: function () {
      if (!this.assets) {
        this.assets = require(assetsJsonFile).assets;
      }
      return this;
    },

    /**
     * Loads assets json if not done, gets the main script asset name,
     * and joins it to the base directory.
     * @returns {String} The main script asset file path.
     */
    mainScript: function () {
      this.load();
      var main = Array.isArray(this.assets.main) ? this.assets.main[0] : this.assets.main;
      return path.join(this.baseDir, main);
    }
  };
  return new Config(baseDir);
}

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
  browserConfig: 'browserconfig.xml',
  serviceWorker: {
    registration: path.join(commonDirs.scripts, 'service-worker-registration.js'),
    import: path.join(commonDirs.scripts, 'service-worker-import.js'),
    main: 'service-worker.js'
  }
};

/***
 * Directories and files that are in both dist and web
 */
var outputDirs = {
  // scripts: 'scripts'
};
var outputFiles = {
  css: path.join(commonDirs.styles, 'index.css')
};

/***
 * Source only dirs and files
 */
var srcDirs = {
  components: 'components',
  config: 'configs',
  assets: assetsbase
};
var srcFiles = {
  assetsJson: path.join(srcDirs.config, path.basename(__dirname), assetsJsonFile)
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
  config.web.assets = assetsConfig(config.web.scripts);
  // Set to root to allow service worker full app control
  config.web.serviceWorker.main = '/' + commonFiles.serviceWorker.main;

  return config;
}

module.exports = makeConfig;
