// Karma configuration
// Generated on Fri Nov 25 2016 21:41:08 GMT-0800 (PST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: [
        'jasmine',
        'detectBrowsers'
    ],


    // list of files / patterns to load in the browser
    files: [
      'specs/*.spec.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'specs/*.spec.js' : ['webpack']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    detectBrowsers: {
      enabled: true,
      usePhantomJS: false,
      postDetection: function(browsers) {
        if(process.env.TRAVIS) {
          var i = browsers.indexOf('Chrome');
          if (i !== -1) {
            browsers[i] = 'Chrome_travis_ci';
          }
        }
        return browsers;
      },
    },

    plugins: [
      'karma-jasmine',
      'karma-webpack',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-ie-launcher',
      'karma-edge-launcher',
      'karma-safari-launcher',
      'karma-detect-browsers'
    ],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,




      // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
