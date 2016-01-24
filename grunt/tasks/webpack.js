/***
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * grunt-webpack grunt config.
 * Requires nconfig task to run first.
 */
'use strict';

var webpack = require('webpack');
var merge = require('lodash/object/merge');

/**
 * Generate the webpack assets config
 *
 * @param {Object} self - A reference to the current webpack execution context
 * @param {String} [statsJson] - A path to a file to collect the build stats.
 */
function webpackStatsPlugin (self, statsJson) {
  self.plugin('done', function (stats) {
    var fs = require('fs');

    var assetsJsonFile = self.options.custom.assetsJson;
    var data = stats.toJson();
    var assets = data.assetsByChunkName;
    var output = {
      assets: {}
    };

    Object.keys(assets).forEach(function (key) {
      var value = assets[key];

      // If regex matched, use [name] for key
      var matches = key.match(self.options.custom.CHUNK_REGEX);
      if (matches) {
        key = matches[1];
      }
      output.assets[key] = value;
    });

    // If assetsJsonFile exists, merge output
    if (fs.existsSync(assetsJsonFile)) {
      var previousOutput = JSON.parse(
        fs.readFileSync(assetsJsonFile, { encoding: 'utf8' })
      );
      output = merge(previousOutput, output);
    }

    fs.writeFileSync(assetsJsonFile, JSON.stringify(output, null, 4));

    if (statsJson) {
      fs.writeFileSync(statsJson, JSON.stringify(data));
    }
  });
}

/**
 * Create the webpack uglifyJSPlugin with its options.
 */
function createUglifyPlugin () {
  return new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    },
    output: {
      comments: false
    }
  });
}

/**
 * Create the inline/header build config.
 *
 * @param {Boolean} prod - True for production.
 * @returns {Object} A webpack configuration for the inline/header bundle.
 */
function headerConfig (prod) {
  var config = {
    entry: './<%= project.src.headerScript %>',
    output: {
      path: '<%= project.dist.scripts %>',
      filename: 'header.js'
    },
    stats: {
      colors: true
    }
  };

  if (prod) {
    config.plugins = [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
        }
      }),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),
      createUglifyPlugin()
    ];
  }

  return config;
}

/**
 * Create the swReg build config.
 *
 * @param {String} type - 'dev', 'prod', or 'perf'.
 * @returns {Object} A webpack configuration for the swReg bundle.
 */
function swRegConfig (type) {
  var devtoolModuleFilenameTemplate = 'webpack:///sw-reg/[resource-path]';

  var config = {
    entry: {
      swReg: './<%= project.src.serviceWorker.registration %>'
    },
    output: {
      path: '<%= project.dist.scripts %>',
      publicPath: '<%= project.web.scripts %>'
    },
    plugins: [
      function () {
        return webpackStatsPlugin(this);
      }
    ]
  };

  if (type === 'prod' || type === 'perf') {
    config.output.filename = '[name].[chunkhash].min.js';
  }
  else {
    // dev only
    config.output.filename = '[name].js';
  }

  if (type === 'dev' || type === 'perf') {
    config.output.devtoolModuleFilenameTemplate = devtoolModuleFilenameTemplate;
    config.devtool = 'source-map';
  } else {
    // prod only
    config.plugins = [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),
      createUglifyPlugin()
    ].concat(config.plugins);
  }

  return config;
}

/**
 * Create service worker build config.
 *
 * @param {String} type - 'dev', 'prod', or 'perf'.
 * @returns {Object} A webpack configuration for the service worker bundle.
 */
function swConfig (type) {
  var devtoolModuleFilenameTemplate = 'webpack:///sw/[resource-path]';

  var config = {
    entry: {
      sw: './<%= project.src.serviceWorker.entry %>'
    },
    output: {
      path: '<%= project.dist.scripts %>',
      publicPath: '<%= project.web.scripts %>'
    },
    target: 'webworker',
    plugins: [
      function () {
        return webpackStatsPlugin(this);
      }
    ]
  };

  if (type === 'prod' || type === 'perf') {
    config.output.filename = '[name].[chunkhash].min.js';
  } else {
    // dev only
    config.output.filename = '[name].js';
  }

  if (type === 'dev' || type === 'perf') {
    config.devtool = 'source-map';
    config.output.devtoolModuleFilenameTemplate = devtoolModuleFilenameTemplate;
  } else {
    // prod only
    config.plugins = [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),
      createUglifyPlugin()
    ].concat(config.plugins);
  }

  return config;
}

/**
 * Create the main build config.
 *
 * @param {String} type - 'dev', 'prod', or 'perf'.
 * @returns {Object} A webpack configuration for the main bundle.
 */
function mainConfig (type) {
  var devtoolModuleFilenameTemplate = 'webpack:///main/[resource-path]';

  var config = {
    resolve: {
      extensions: ['', '.js', '.jsx']
    },
    entry: './client.js',
    output: {
      path: '<%= project.dist.scripts %>',
      publicPath: '<%= project.web.scripts %>/'
    },
    module: {
      loaders: [
        { test: /\.jsx$/, loader: 'jsx-loader' }
      ]
    },
    node: {
      setImmediate: false
    },
    stats: {
      colors: true
    }
  };

  if (type === 'prod' || type === 'perf') {
    config.output.filename = '[name].[chunkhash].min.js';
    config.output.chunkFilename = '[name].[chunkhash].min.js';
    config.progress = false;
  } else {
    // dev only
    config.output.filename = '[name].js';
    config.output.chunkFilename = '[name].js';
    config.keepalive = true;
    config.watch = true;
  }

  if (type === 'dev' || type === 'perf') {
    var definitions = type === 'dev' ? {
      DEBUG: true
    } : {
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    };
    config.output.devtoolModuleFilenameTemplate = devtoolModuleFilenameTemplate;
    config.devtool = 'source-map';
    config.plugins = [
      new webpack.DefinePlugin(definitions),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.NormalModuleReplacementPlugin(/lodash\.assign/, require.resolve('object-assign')),
      new webpack.NormalModuleReplacementPlugin(/object\-assign/, require.resolve('object-assign')),
      new webpack.NormalModuleReplacementPlugin(/ReactDOMServer/, require.resolve('../../utils/react/reactDOMServer')),
      new webpack.NormalModuleReplacementPlugin(/^react\-?$/, require.resolve('react')),
      function () {
        return webpackStatsPlugin(this);
      }
    ];
  } else {
    // prod only
    config.plugins = [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
        }
      }),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.NormalModuleReplacementPlugin(/lodash\.assign/, require.resolve('object-assign')),
      new webpack.NormalModuleReplacementPlugin(/object\-assign/, require.resolve('object-assign')),
      new webpack.NormalModuleReplacementPlugin(/ReactDOMServer/, require.resolve('../../utils/react/reactDOMServer')),
      new webpack.NormalModuleReplacementPlugin(/^react\-?$/, require.resolve('react')),
      createUglifyPlugin(),
      function () {
        return webpackStatsPlugin(this, 'webpack-stats-main.json');
      }
    ];
  }

  return config;
}

module.exports = function (grunt) {
  grunt.config('webpack', {
    options: {
      custom: {
        assetsJson: '<%= project.src.assetsJson %>',
        CHUNK_REGEX: /^([A-Za-z0-9_\-]+)\..*/
      }
    },
    headerDev: headerConfig(false),
    headerProd: headerConfig(true),
    'swReg-dev': swRegConfig('dev'),
    'swReg-prod': swRegConfig('prod'),
    'swReg-perf': swRegConfig('perf'),
    'sw-dev': swConfig('dev'),
    'sw-prod': swConfig('prod'),
    'sw-perf': swConfig('perf'),
    dev: mainConfig('dev'),
    prod: mainConfig('prod'),
    perf: mainConfig('perf')
  });

  grunt.loadNpmTasks('grunt-webpack');
};
