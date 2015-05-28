module.exports = function(config) {
   config.set({
      basePath: '',
      frameworks: ['jasmine'],
      files: [
         'lib/jquery/jquery.js',
         'dist/jquery.tagsinput.min.js',
         'test/helpers.js',
         {
            pattern: 'test/jquery.tagsinput/*.tests.js'
         }
      ],
      reporters: ['progress'],
      port: 9876,
      logLevel: config.LOG_DEBUG,
      // logLevel: config.LOG_DISABLE,
      captureTimeout: 60000
   });
};
