var assert = require('assert');
var path = require('path');


/**
 * @param {Object} grunt Grunt.
 */
module.exports = function(grunt) {

  var log = [];

  grunt.initConfig({
    newer: {
      options: {
        cache: path.join(__dirname, '.cache'),
        override: function(details, include) {
          assert.equal(details.task, 'log');
          assert.equal(details.target, 'all');
          assert.equal(typeof details.path, 'string');
          assert(details.time instanceof Date, 'Expected time to be a Date');
          // if called with three.js, include it
          if (path.basename(details.path) === 'three.js') {
            process.nextTick(function() {
              include(true);
            });
          } else {
            process.nextTick(function() {
              include(false);
            });
          }
        }
      }
    },
    modified: {
      one: {
        src: 'src/one.js'
      },
      oneThree: {
        src: ['src/one.js', 'src/three.js']
      },
      three: {
        src: 'src/three.js'
      },
      all: {
        src: 'src/**/*.js'
      },
      none: {
        src: []
      }
    },
    log: {
      all: {
        src: 'src/**/*.js',
        getLog: function() {
          return log;
        }
      }
    },
    assert: {
      that: {
        getLog: function() {
          return log;
        }
      }
    }
  });

  grunt.loadTasks('../../../tasks');
  grunt.loadTasks('../../../test/integration/tasks');

  grunt.registerTask('default', function() {

    grunt.task.run([
      // run the log task with newer, expect all files
      'newer:log',
      'assert:that:modified:all',

      // HFS+ filesystem mtime resolution
      'wait:1001',

      // modify one file
      'modified:one',

      // run log task again, expect one.js and three.js (due to override)
      'newer:log',
      'assert:that:modified:oneThree',

      // HFS+ filesystem mtime resolution
      'wait:1002',

      // modify nothing, expect three.js (due to override)
      'newer:log',
      'assert:that:modified:three'

    ]);

  });

};
