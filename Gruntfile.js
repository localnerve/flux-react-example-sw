/***
 * Copyright 2015, Alex Grant, LocalNerve, LLC.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var webpack = require('webpack');
var _nconfig;

/**
 * Generate the webpack assets config
 *
 * @param {Object} self - A reference to the current webpack execution context
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

    Object.keys(assets).forEach(function (key) {
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

/**
 * The grunt function export
 */
module.exports = function (grunt) {
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    autoprefixer: {
      options: {
        browsers: ['last 2 versions', '> 2% in US']
      },
      all: {
        src: '<%= project.dist.css %>'
      }
    },

    clean: ['<%= project.dist.baseDir %>'],

    copy: {
      assets: {
        files: [{
          expand: true,
          cwd: '<%= project.src.assets %>',
          src: ['**', '!**/styles/**', '!images/*.svg', '!scripts/**'],
          dest: '<%= project.dist.baseDir %>/'
        }]
      }
    },

    compass: {
      options: {
        sassDir: '<%= project.src.styles %>',
        imagesDir: '<%= project.dist.images %>',
        httpImagesPath: '<%= project.web.images %>',
        fontsDir: '<%= project.dist.fonts %>',
        httpFontsPath: '<%= project.web.fonts %>',
        cssDir: '<%= project.dist.styles %>',
        httpPath: '/',
        importPath: [
          '<%= project.vendor.css %>',
          '<%= project.src.components %>',
          'node_modules/react-spinner'
        ],
        environment: 'development',

        httpGeneratedImagesPath: '<%= project.web.images %>'
      },
      dev: {
        options: {
          watch: false
        }
      },
      watch: {
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
      css: ['_cc-watch-ap', '_cc-watch-compass'],
      dev: ['_cc-compass-dev', '_cc-nodemon-dev', '_cc-webpack-dev'],
      debug: ['_cc-compass-dev', '_cc-nodemon-debug', '_cc-webpack-dev'],
      prod: ['_cc-compass-prod', '_cc-nodemon-prod', '_cc-webpack-prod'],
      perf: ['_cc-compass-prod', '_cc-nodemon-prod', '_cc-webpack-perf']
    },

    cssmin: {
      prod: {
        files: [{
          src: '<%= project.dist.css %>',
          dest: '<%= project.dist.css %>'
        }]
      }
    },

    fixtures: {
      options: {
        generators: 'tests/generators',
        'routes-models.js': {
          output: {
            routes: 'tests/fixtures/routes-response.js',
            models: 'tests/fixtures/models-response.js'
          }
        }
      }
    },

    imagemin: {
      all: {
        files: [{
          expand: true,
          cwd: '<%= project.src.images %>/',
          src: ['**/*.{jpg,jpeg,png}'],
          dest: '<%= project.dist.images %>/'
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
          '{configs,utils,actions,components,services,stores,tests}/**/*.js'
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
            // Can add any env vars here to test out in dev
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
          ignore: ['node_modules/**', '<%= project.distbase %>/**'],
          ext: 'js,jsx'
        },
        script: './<%= pkg.main %>'
      },
      debug: {
        options: {
          ignore: ['node_modules/**', '<%= project.distbase %>/**'],
          ext: 'js,jsx',
          nodeArgs: ['--debug-brk']
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
          emulateMobile: true,
          runs: 3,
          budget: {
            // nominal is < 1400 on 3g, but bg-image doubles it
            SpeedIndex: 2800
          }
        }
      }
    },

    svg2png: {
      all: {
        files: [{
          cwd: '<%= project.src.images %>/',
          src: ['**/*.svg'],
          dest: '<%= project.dist.images %>/'
        }]
      }
    },

    svgmin: {
      options: {
      },
      all: {
        files: [{
          expand: true,
          cwd: '<%= project.src.images %>/',
          src: ['**/*.svg'],
          dest: '<%= project.dist.images %>/'
        }]
      }
    },

    watch: {
      ap: {
        options: {
          spawn: false
        },
        files: '<%= project.dist.css %>',
        tasks: ['autoprefixer']
      }
    },

    webpack: {
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
            }
          })
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
    }

  });

  /**
   * _runFixtureGenerators custom task
   * Runs the fixture generators using backend data services.
   * Backend data sources selected by environment -
   *   Must be run after nconfig
   * This private task is only run by 'fixtures' task.
   *
   * @access private
   */
  grunt.registerTask('_runFixtureGenerators', 'Subtask to generate test fixtures', function () {
    var fs = require('fs');
    var path = require('path');
    var generator, options = this.options();

    var async = this.async();

    fs.readdirSync(options.generators).forEach(function (item) {
      generator = './'+path.join(options.generators, item);
      grunt.log.writeln(
        'Executing '+generator + '(' +
          require('util').inspect(options[item].output) + ', callback)'
      );
      require(generator)(options[item].output, async);
    });
  });

  /**
   * fixtures custom task
   * Runs nconfig and _runFixtureGenerators in order.
   * Syntax: fixtures:dev | fixtures:prod
   *
   * @access public
   */
  grunt.registerTask('fixtures', 'Generate test fixtures', function () {
    var isProd = this.args.shift() === 'prod';
    var options = {
      options: this.options()
    };

    var tasks = [
      'nconfig:'+(isProd ? 'prod' : 'dev'),
      '_runFixtureGenerators'
    ];

    // Pass along the options to subtasks
    grunt.config.set('_runFixtureGenerators', options);

    grunt.task.run(tasks);
  });

  /**
   * nconfig custom task
   * Creates a config for the project, saves nconfig.settings to grunt.config('project')
   * Must run per grunt process.
   *
   * Options:
   *  overrides: An object with config settings that overrides all.
   *             example: settings:dist:images
   *  env: Set environment variables for this process.
   *
   * @access public
   */
  grunt.registerMultiTask('nconfig', 'Assign config settings to grunt project', function () {
    _nconfig = true;
    var configLib = require('./configs');
    var options = this.options();

    if (options.env) {
      Object.keys(options.env).forEach(function(key) {
        process.env[key] = options.env[key];
      });
    }

    grunt.config('project', configLib.create(options.overrides).settings);
  });

  /**
   * Debug the nconfig task.
   * Dumps the computed config to the console.
   * Private task used by dumpconfig.
   *
   * @access private
   */
  grunt.registerTask('_dumpconfigTask', function() {
    var util = require('util');
    var config = require('./configs').create();
    var dump = {
      project: grunt.config('project'),
      nconf: config
    };
    console.log(util.inspect(dump));
  });

  /**
   * dumpconfig custom task.
   * Dumps the computed nconfig to the console by env.
   * Syntax: dumpconfig:prod | dumpconfig:dev
   *
   * @access public
   */
  grunt.registerTask('dumpconfig', 'Debug nconfig', function() {
    var isProd = this.args.shift() === 'prod';
    var tasks = ['nconfig:'+(isProd ? 'prod' : 'dev')];

    grunt.task.run(tasks.concat('_dumpconfigTask'));
  });

  /**
   * scss compile custom task
   * Sets the env config if req'd, runs required css build tasks, compiles, then runs post processing.
   * Used only for standalone css builds outside of the main dev task.
   * Syntax: ccss:prod | ccss:dev
   *
   * @access public
   */
  grunt.registerTask('ccss', 'Compile scss', function() {
    var isProd = this.args.shift() === 'prod';
    var tasks = _nconfig ? [] : ['nconfig:'+(isProd ? 'prod' : 'dev')];

    tasks = tasks.concat([
      'svg2png', 'svgmin', 'compass:'+(isProd ? 'prod' : 'dev'), 'autoprefixer'
    ]);
    if (!isProd) {
      tasks = tasks.concat(['concurrent:css']);
    }

    grunt.task.run(isProd ? tasks.concat(['cssmin:prod']) : tasks);
  });

  /**
   * Custom task to build the header script, standalone (w/o the dev task).
   * For now, just uses webpack, but that makes it unnecessarily bigger.
   * Syntax: header:dev | header:prod
   *
   * @access public
   */
  grunt.registerTask('header', 'Build the header script', function() {
    var isProd = this.args.shift() === 'prod';
    var tasks;
    if (isProd) {
      tasks = ['nconfig:prod', 'webpack:headerProd'];
    }
    else {
      tasks = ['nconfig:dev', 'webpack:headerDev'];
    }
    grunt.task.run(tasks);
  });

  // serial task sequences for concurrent, external grunt processes
  grunt.registerTask('_cc-watch-compass', ['nconfig:dev', 'compass:watch']);
  grunt.registerTask('_cc-watch-ap', ['nconfig:dev', 'watch:ap']);
  grunt.registerTask('_cc-compass-dev', ['nconfig:dev', 'ccss:dev']);
  grunt.registerTask('_cc-compass-prod', ['nconfig:prod', 'ccss:prod']);
  grunt.registerTask('_cc-nodemon-dev', ['nconfig:dev', 'nodemon:app']);
  grunt.registerTask('_cc-nodemon-debug', ['nconfig:dev', 'nodemon:debug']);
  grunt.registerTask('_cc-nodemon-prod', ['nconfig:prod', 'nodemon:app']);
  grunt.registerTask('_cc-webpack-dev', ['nconfig:dev', 'webpack:headerDev', 'webpack:dev']);
  grunt.registerTask('_cc-webpack-prod', ['nconfig:prod', 'webpack:headerProd', 'webpack:prod']);
  grunt.registerTask('_cc-webpack-perf', ['nconfig:prod', 'webpack:headerProd', 'webpack:perf']);

  // Other development grunt commands commonly used:
  // dumpconfig:dev | dumpconfig:prod - dump nconfig configuration

  // script interface
  grunt.registerTask('default', 'dev');
  grunt.registerTask('dev', ['nconfig:dev', 'clean', 'copy', 'jshint', 'concurrent:dev']);
  grunt.registerTask('debug', ['nconfig:dev', 'clean', 'copy', 'jshint', 'concurrent:debug']);
  grunt.registerTask('prod', ['nconfig:prod', 'clean', 'copy', 'jshint', 'imagemin', 'concurrent:prod']);
  grunt.registerTask('perf', ['nconfig:prod', 'clean', 'copy', 'jshint', 'imagemin', 'concurrent:perf']);
  grunt.registerTask('build', [
    'nconfig:prod', 'clean', 'copy', 'imagemin', 'ccss:prod', 'webpack:headerProd', 'webpack:prod'
  ]);
  // Also used:
  //   1. fixtures:dev | fixtures:prod - generate/update test fixtures from backend
  //   2. jshint
};
