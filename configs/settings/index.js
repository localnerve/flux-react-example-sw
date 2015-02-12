/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var path = require('path');
var _ = require('lodash');

var assetsJsonFile = './assets.json';
var distbase = 'dist';
var publicbase = '/public';

/**
 * Prepends a path to object values.
 * Returns a new object result.
 */
function prependPathToObject(fromObj, prePath) {
  return Object.keys(fromObj).reduce(function(obj, key) {
    var fromValue = fromObj[key];
    if (typeof fromValue === 'string') {
      obj[key] = path.join(prePath, fromValue);
    } else {
      obj[key] = fromValue;
    }
    return obj;
  }, {});
}

/**
 * A configuration for loading and decorating assets json at a later time
 */
function assetsConfig(baseDir) {
  function Config(dir) {
    this.baseDir = dir;
  }
  Config.prototype = {
    load: function() {
      if (!this.assets) {
        this.assets = require(assetsJsonFile).assets;
      }
      return this;
    },
    mainScript: function() {
      this.load();
      var main = Array.isArray(this.assets.main) ? this.assets.main[0] : this.assets.main;
      return path.join(this.baseDir, main);
    }
  };
  return new Config(baseDir);
}

function makeConfig(nconf) {

  /**
   * Directories and files that are in src, distribution, and web
   */
  var commonDirs = {
    images: 'images',  
    styles: 'styles',
    fonts: 'fonts'
  };
  var commonFiles = {
    four04: '404.html',
    five03: '503.html',
    favicon: path.join(commonDirs.images, 'favicon.ico'),  
    robots: 'robots.txt',
    sitemap: 'sitemap.xml'
  };

  /**
   * Directories and files that are in both dist and web
   */
  var outputDirs = {
    scripts: 'scripts'
  };
  var outputFiles = {
    css: path.join(commonDirs.styles, 'index.css')
  };

  /**
   * Source only dirs and files
   */
  var srcDirs = {
    components: 'components',
    config: 'configs'  
  };
  var srcFiles = {
    assetsJson: path.join(srcDirs.config, path.basename(__dirname), assetsJsonFile)  
  };

  /**
   * Settings to override by environment
   */
  var overrides = {
    production: {
      dist: {
        baseDir: path.join(distbase, 'release')
      },
      loggerFormat: 'tiny',
      web: {
        // ssl: true,
        assetAge: 31556926000
      }
    }
  };

  /**
   * The exported settings config
   */
  var config = {
    dist: {
      baseDir: path.join(distbase, 'debug')
    },
    src: {
      baseDir: '.'
    },
    web: {
      baseDir: publicbase,
      assetAge: 0,
      ssl: false
    },

    // unmovable project directories
    distbase: distbase,
    reports: 'reports',
    vendor: 'vendor',

    loggerFormat: 'dev'
  };

  // Environment overrides
  _.merge(config, overrides[nconf.get('NODE_ENV')]);

  // Assemble config.src
  _.assign(
    config.src,
    prependPathToObject(commonDirs, config.src.baseDir),
    prependPathToObject(commonFiles, config.src.baseDir),
    prependPathToObject(srcDirs, config.src.baseDir),
    prependPathToObject(srcFiles, config.src.baseDir)
  );

  // Assemble config.dist and config.web
  [config.dist, config.web].forEach(function(config) {
    _.assign(
      config,
      prependPathToObject(commonDirs, config.baseDir),
      prependPathToObject(commonFiles, config.baseDir),
      prependPathToObject(outputDirs, config.baseDir),
      prependPathToObject(outputFiles, config.baseDir)
    );
  });
  config.web.assets = assetsConfig(config.web.scripts);

  return config;
}

module.exports = makeConfig;