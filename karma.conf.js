// Karma configuration
// Generated on Tue Dec 08 2015 10:17:59 GMT-0800 (PST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'assets/js/dependencies/angular/angular.min.js',
      'assets/js/dependencies/angular/angular-resource.min.js',
      'assets/js/dependencies/angular/angular-cookies.min.js',
      'assets/js/dependencies/angular/angular-mocks.js',
      'assets/js/dependencies/ui-router/ui-router.min.js',
      'assets/js/dependencies/jquery/jquery-2.1.1.min.js',
      'assets/js/dependencies/**/*.js',

        // Load utilities
      'assets/js/common/directives/directives.js',
      'assets/js/common/filters/filters.js',
      'assets/js/common/models/models.js',
      'assets/js/common/services/services.js',
      'assets/js/common/**/*.js',

      // All of the rest of your client-side js files
      // will be injected here in no particular order.
      'assets/js/app/**/**.module.js',
      'assets/js/**/*.js',

      'test/karma/**/*.js',

      { pattern: 'assets/js/mock/models/**/*.json', watched: true, served: true, included: false }
    ],

    proxies: {
      '/api' : 'http://127.0.0.1:3000/api'
    },

    // list of files to exclude
    exclude: [
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters:['html','progress','coverage'],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'assets/js/app/**/*.js': ['coverage'],
      'assets/js/common/**/*.js': ['coverage']
    },


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultanous
    concurrency: Infinity
  })
}
