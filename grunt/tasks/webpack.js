/***
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
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
 */
function webpackStatsPlugin(self) {
  self.plugin('done', function(stats) {
    var fs = require('fs');

    var assetsJsonFile = self.options.custom.assetsJson;
    var data = stats.toJson();
    var assets = data.assetsByChunkName;
    var output = {
      assets: {}
    };

    Object.keys(assets).forEach(function (key) {
      var value = assets[key];

      // if regex matched, use [name] for key
      var matches = key.match(self.options.custom.CHUNK_REGEX);
      if (matches) {
        key = matches[1];
      }
      output.assets[key] = value;
    });


    // if file exists, merge output
    if (fs.existsSync(assetsJsonFile)) {
      var previousOutput = JSON.parse(
        fs.readFileSync(assetsJsonFile, { encoding: 'utf8' })
      );
      output = merge(previousOutput, output);
    }

    fs.writeFileSync(assetsJsonFile, JSON.stringify(output, null, 4));
  });
}

module.exports = function (grunt) {
  grunt.config('webpack', {
    options: {
      custom: {
        assetsJson: '<%= project.src.assetsJson %>',
        CHUNK_REGEX: /^([A-Za-z0-9_\-]+)\..*/
      }
    },
    headerDev: {
      entry: './<%= project.src.headerScript %>',
      output: {
        path: '<%= project.dist.scripts %>',
        filename: 'header.js'
      },
      module: {},
      stats: {
        colors: true
      }
    },
    headerProd: {
      entry: './<%= project.src.headerScript %>',
      output: {
        path: '<%= project.dist.scripts %>',
        filename: 'header.js'
      },
      module: {},
      plugins: [
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: JSON.stringify('production')
          }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: false
          },
          output: {
            comments: false
          }
        })
      ]
    },
    'swReg-dev': {
      entry: {
        swReg: './<%= project.src.serviceWorker.registration %>'
      },
      output: {
        path: '<%= project.dist.scripts %>',
        publicPath: '<%= project.web.scripts %>',
        filename: '[name].js'
      },
      plugins: [
        function () {
          return webpackStatsPlugin(this);
        }
      ]
    },
    'swReg-prod': {
      entry: {
        swReg: './<%= project.src.serviceWorker.registration %>'
      },
      output: {
        path: '<%= project.dist.scripts %>',
        publicPath: '<%= project.web.scripts %>',
        filename: '[name].[chunkhash].min.js'
      },
      plugins: [
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: false
          },
          output: {
            comments: false
          }
        }),
        function () {
          return webpackStatsPlugin(this);
        }
      ]
    },
    'swReg-perf': {
      entry: {
        swReg: './<%= project.src.serviceWorker.registration %>'
      },
      output: {
        path: '<%= project.dist.scripts %>',
        publicPath: '<%= project.web.scripts %>',
        filename: '[name].[chunkhash].min.js'
      },
      plugins: [
        function () {
          return webpackStatsPlugin(this);
        }
      ]
    },
    'sw-dev': {
      entry: {
        sw: './<%= project.src.serviceWorker.entry %>'
      },
      output: {
        path: '<%= project.dist.scripts %>',
        publicPath: '<%= project.web.scripts %>',
        filename: '[name].js'
      },
      target: 'webworker',
      plugins: [
        function () {
          return webpackStatsPlugin(this);
        }
      ]
    },
    'sw-prod': {
      entry: {
        sw: './<%= project.src.serviceWorker.entry %>'
      },
      output: {
        path: '<%= project.dist.scripts %>',
        publicPath: '<%= project.web.scripts %>',
        filename: '[name].[chunkhash].min.js'
      },
      target: 'webworker',
      plugins: [
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: false
          },
          output: {
            comments: false
          }
        }),
        function () {
          return webpackStatsPlugin(this);
        }
      ]
    },
    'sw-perf': {
      entry: {
        sw: './<%= project.src.serviceWorker.entry %>'
      },
      output: {
        path: '<%= project.dist.scripts %>',
        publicPath: '<%= project.web.scripts %>',
        filename: '[name].[chunkhash].min.js'
      },
      target: 'webworker',
      plugins: [
        function () {
          return webpackStatsPlugin(this);
        }
      ]
    },
    dev: {
      resolve: {
        extensions: ['', '.js', '.jsx']
      },
      entry: './client.js',
      output: {
        path: '<%= project.dist.scripts %>',
        publicPath: '<%= project.web.scripts %>',
        filename: '[name].js',
        chunkFilename: '[name].js'
      },
      module: {
        loaders: [
          { test: /\.jsx$/, loader: 'jsx-loader' }
        ]
      },
      node: {
        setImmediate: false
      },
      plugins: [
        new webpack.DefinePlugin({
          DEBUG: true
        }),

        // Optional, use to see the prod module representation in devtools
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),

        new webpack.NormalModuleReplacementPlugin(/^react(\/addons)?$/, require.resolve('react/addons')),
        function () {
          return webpackStatsPlugin(this);
        }
      ],
      stats: {
        colors: true
      },
      devtool: 'source-map',
      watch: true,
      keepalive: true
    },
    prod: {
      resolve: {
        extensions: ['', '.js', '.jsx']
      },
      entry: './client.js',
      output: {
        path: '<%= project.dist.scripts %>',
        publicPath: '<%= project.web.scripts %>',
        filename: '[name].[chunkhash].min.js',
        chunkFilename: '[name].[chunkhash].min.js'
      },
      module: {
        loaders: [
          { test: /\.jsx$/, loader: 'jsx-loader' }
        ]
      },
      node: {
        setImmediate: false
      },
      plugins: [
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: JSON.stringify('production')
          }
        }),
        // These are performance optimizations for your bundles
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),

        // This ensures requires for `react` and `react/addons` normalize to the same requirement
        new webpack.NormalModuleReplacementPlugin(/^react(\/addons)?$/, require.resolve('react/addons')),

        new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: false
          },
          output: {
            comments: false
          }
        }),

        // generates webpack assets config to use hashed assets in production mode
        function () {
          return webpackStatsPlugin(this);
        }
      ],
      // removes verbosity from builds
      progress: false
    },
    perf: {
      resolve: {
        extensions: ['', '.js', '.jsx']
      },
      entry: './client.js',
      output: {
        path: '<%= project.dist.scripts %>',
        publicPath: '<%= project.web.scripts %>',
        filename: '[name].[chunkhash].min.js',
        chunkFilename: '[name].[chunkhash].min.js'
      },
      module: {
        loaders: [
          { test: /\.jsx$/, loader: 'jsx-loader' }
        ]
      },
      node: {
        setImmediate: false
      },
      plugins: [
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: JSON.stringify('production')
          }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.NormalModuleReplacementPlugin(/^react(\/addons)?$/, require.resolve('react/addons')),
        function () {
          return webpackStatsPlugin(this);
        }
      ],
      devtool: 'source-map',
      progress: false
    }
  });

  grunt.loadNpmTasks('grunt-webpack');
};
