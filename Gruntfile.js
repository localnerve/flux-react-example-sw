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
      assets: {
        files: [{
          expand: true,
          cwd: '<%= project.src.assets %>',
          src: ['**', '!**/styles/**'],
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
      dev: ['_cc-compass-dev', '_cc-nodemon-dev', '_cc-webpack-dev'],
      prod: ['_cc-compass-prod', '_cc-nodemon-prod', '_cc-webpack-prod']
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
      options: {
        jshintrc: true
      },      
      all: {
        src: [
          '*.js',
          '{configs,utils,actions,components,services,stores}/**/*.js'        
        ]
      }
    },

    nconfig: {
      dev: {
        options: {
          overrides: {},
          env: {
            DEBUG: '*',
            // ERR_HANDLER_MAINT_ENABLED: TRUE,
            ERR_HANDLER_MAINT_RETRYAFTER: 7200
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
        options: {
          ignore: ['<%= project.distbase %>/**'],
          ext: 'js,jsx,md'
        },        
        script: './<%= pkg.main %>'
      }
    },

    perfbudget: {
      options: {
        url: process.env.DEPLOY_URL,
        key: process.env.WPT_API_KEY,
        location: 'Dulles:Chrome',
        repeatView: false,
        timeout: 300
      },
      mobile: {
        options: {
          connectivity: '3G',          
          runs: 3,
          budget: {
            SpeedIndex: 1500
          }
        }
      }
    },

    webpack: {
      options: {
        custom: {
          assetsJson: '<%= project.src.assetsJson %>',
          CHUNK_REGEX: /^([A-Za-z0-9_\-]+)\..*/
        }
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
            { test: /\.css$/, loader: 'style!css' },
            { test: /\.jsx$/, loader: 'jsx-loader' },
            { test: /\.json$/, loader: 'json-loader'}
          ]
        },
        plugins: [
          new webpack.DefinePlugin({
            DEBUG: true
          }),
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
  // Creates a config for the project, saves config(settings) in grunt.config('project')
  // 
  // Options:
  //  overrides: An object with config settings that overrides all.
  //             example: settings:dist:images
  //  env: Set environment variables for this process.
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

  // debug nconfig
  grunt.registerTask('_dumpconfigTask', function() {
    var util = require('util');
    var config = require('./configs').create();
    var dump = {
      project: grunt.config('project'),
      nconf: config.get()
    };
    console.log(util.inspect(dump));
  });
  grunt.registerTask('dumpconfig', 'Debug nconfig', function() {
    var tasks = [
      this.args.shift() === 'prod' ? 'nconfig:prod' : 'nconfig:dev'
    ];
    grunt.task.run(tasks.concat('_dumpconfigTask'));
  });

  // serial tasks for concurrent, external grunt processes
  grunt.registerTask('_cc-compass-dev', ['nconfig:dev', 'compass:dev']);
  grunt.registerTask('_cc-compass-prod', ['nconfig:prod', 'compass:prod', 'cssmin:prod']);
  grunt.registerTask('_cc-nodemon-dev', ['nconfig:dev', 'nodemon:app']);
  grunt.registerTask('_cc-nodemon-prod', ['nconfig:prod', 'nodemon:app']);
  grunt.registerTask('_cc-webpack-dev', ['nconfig:dev', 'webpack:dev']);
  grunt.registerTask('_cc-webpack-prod', ['nconfig:prod', 'webpack:prod']);

  // script interface
  grunt.registerTask('default', 'dev');
  grunt.registerTask('dev', ['nconfig:dev', 'clean', 'copy', 'jshint', 'concurrent:dev']);
  grunt.registerTask('prod', ['nconfig:prod', 'clean', 'copy', 'jshint', 'concurrent:prod']);
  grunt.registerTask('build', ['nconfig:prod', 'clean', 'copy', 'compass:prod', 'cssmin:prod', 'webpack:prod']);
};