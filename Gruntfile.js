/**
 * Copyright 2015, Alex Grant, LocalNerve, LLC.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var webpack = require('webpack');

/**
 * Generate the webpack assets config
 */
function webpackStatsPlugin(self) {
  self.plugin('done', function(stats) {
    var path = require('path');
    var fs = require('fs');

    var data = stats.toJson();              
    var assets = data.assetsByChunkName;
    var output = {
      assets: {}
      // , cdnPath: this.options.output.publicPath
    };

    Object.keys(assets).forEach(function eachAsset(key) {
      var value = assets[key];

      // if regex matched, use [name] for key
      var matches = key.match(self.options.custom.CHUNK_REGEX);
      if (matches) {
        key = matches[1];
      }
      output.assets[key] = value;
    });

    // put it out in the dist 
    fs.writeFileSync(
      path.join(__dirname, self.options.custom.assetsJson),
      JSON.stringify(output, null, 4)
    );
  });
}

module.exports = function (grunt) {
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    
    pkg: grunt.file.readJSON('package.json'),

    clean: ['<%= project.dist.baseDir %>'],
    
    copy: {
      images: {
        files: [{
          expand: true,
          src: ['<%= project.src.images %>/**'], dest: '<%= project.dist.baseDir %>'
        }]
      },
      statics: {
        files: [{
          src: ['<%= project.src.four04 %>', '<%= project.src.five03 %>'],
          dest: '<%= project.dist.baseDir %>/'
        }]
      }
    },
    
    compass: {
      options: {
        sassDir: '<%= project.src.styles %>',
        imagesDir: '<%= project.src.images %>',
        fontsDir: '<%= project.src.fonts %>',
        cssDir: '<%= project.dist.styles %>',
        httpPath: '/',
        importPath: [
          // '<%= project.vendor %>/foundation/scss',
          '<%= project.src.components %>'
        ],
        environment: 'development',                

        httpGeneratedImagesPath: '<%= project.web.images %>'
      },
      dev: {
        options: {
          watch: true
        }
      },
      prod: {
        options: {
          outputStyle: 'compressed',
          noLineComments: true,
          environment: 'production'
        }
      }
    },

    concurrent: {
      options: {
        logConcurrentOutput: true
      },      
      dev: ['cc-compass-dev', 'cc-nodemon-dev', 'cc-webpack-dev'],
      prod: ['cc-compass-prod', 'cc-nodemon-prod', 'cc-webpack-prod']
    },

    cssmin: {
      prod: {
        files: [{
          src: '<%= project.dist.css %>',
          dest: '<%= project.dist.css %>'
        }]
      }
    },

    jshint: {
      all: [
        '*.js',
        '{actions,components,services,stores}/**/*.js'
      ],
      options: {
        jshintrc: true
      }
    },

    nconfig: {
      dev: {
        options: {
          overrides: {},
          env: {
            NODE_ENV: 'development',
            DEBUG: '*',
            // MAINT_FLAG: 1,
            MAINT_RETRYAFTER: 14400
          }
        }
      },
      prod: {
        options: {
          env: {
            NODE_ENV: 'production'
          }
        }
      }
    },

    nodemon: {
      app: {
        script: './<%= pkg.main %>',
        options: {
          ignore: ['<%= project.distbase %>/**'],
          ext: 'js,jsx,md'
        }
      }
    },

    webpack: {
      dev: {
        custom: {
          assetsJson: '<%= project.src.assetsJson %>',
          CHUNK_REGEX: /^([A-Za-z0-9_\-]+)\..*/
        },
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
            { test: /\.css$/, loader: 'style!css' },
            { test: /\.jsx$/, loader: 'jsx-loader' },
            { test: /\.json$/, loader: 'json-loader'}
          ]
        },
        plugins: [
          new webpack.NormalModuleReplacementPlugin(/^react(\/addons)?$/, require.resolve('react/addons')),
          function() {
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
        custom: {
          assetsJson: '<%= project.src.assetsJson %>',
          CHUNK_REGEX: /^([A-Za-z0-9_\-]+)\..*/
        },
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
            { test: /\.css$/, loader: 'style!css' },
            { test: /\.jsx$/, loader: 'jsx-loader' },
            { test: /\.json$/, loader: 'json-loader'}
          ]
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
            }
          }),

          // generates webpack assets config to use hashed assets in production mode
          function() {
            return webpackStatsPlugin(this);
          }
        ],
        // removes verbosity from builds
        progress: false
      }
    }
  
  });

  // Custom config task
  // Creates a config instance for the project, saves settings in grunt.config('project')
  // 
  // Options:
  //  overrides: An object with config settings that overrides all. see nconf for details and config/index.js for impl.
  //             example: settings:dist:images
  //  node_env: Set process.env.NODE_ENV for this process.
  //
  grunt.registerMultiTask('nconfig', 'Assign config settings to grunt project', function() {
    var configLib = require('./configs');
    var options = this.options();
    
    if (options.env) {
      Object.keys(options.env).forEach(function(key) {
        process.env[key] = options.env[key];
      });
    }

    grunt.config('project', configLib.create(options.overrides).get('settings'));
  });

  // tasks

  grunt.registerTask('dumpconfigTask', function() {
    var util = require('util');
    var dump = {
      project: grunt.config('project'),
      env: process.env
    };
    console.log(util.inspect(dump));
  });
  grunt.registerTask('dumpconfig', ['nconfig:dev', 'dumpconfigTask']);

  // serial tasks for concurrent, external grunt processes
  grunt.registerTask('cc-compass-dev', ['nconfig:dev', 'compass:dev']);
  grunt.registerTask('cc-compass-prod', ['nconfig:prod', 'compass:prod', 'cssmin:prod']);
  grunt.registerTask('cc-nodemon-dev', ['nconfig:dev', 'nodemon:app']);
  grunt.registerTask('cc-nodemon-prod', ['nconfig:prod', 'nodemon:app']);
  grunt.registerTask('cc-webpack-dev', ['nconfig:dev', 'webpack:dev']);
  grunt.registerTask('cc-webpack-prod', ['nconfig:prod', 'webpack:prod']);

  grunt.registerTask('default', 'dev');
  grunt.registerTask('dev', ['nconfig:dev', 'clean', 'copy', 'jshint', 'concurrent:dev']);
  grunt.registerTask('prod', ['nconfig:prod', 'clean', 'copy', 'jshint', 'concurrent:prod']);
  grunt.registerTask('build', ['nconfig:prod', 'clean', 'copy', 'compass:prod', 'cssmin:prod', 'webpack:prod']);
};