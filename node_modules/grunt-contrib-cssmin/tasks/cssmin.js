/*
 * grunt-contrib-cssmin
 * http://gruntjs.com/
 *
 * Copyright (c) 2014 Tim Branyen, contributors
 * Licensed under the MIT license.
 */

'use strict';
var path = require('path');
var CleanCSS = require('clean-css');
var chalk = require('chalk');
var maxmin = require('maxmin');

module.exports = function(grunt) {
  var minify = function(source, options) {
    try {
      return new CleanCSS(options).minify(source);
    } catch (err) {
      grunt.log.error(err);
      grunt.fail.warn('CSS minification failed.');
    }
  };

  grunt.registerMultiTask('cssmin', 'Minify CSS', function() {
    var options = this.options({
      report: 'min'
    });

    this.files.forEach(function(file) {
      var valid = file.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file ' + chalk.cyan(filepath) + ' not found.');
          return false;
        } else {
          return true;
        }
      });

      var max = '';
      var min = valid.map(function(file) {
        var src = grunt.file.read(file);
        max += src;
        options.relativeTo = path.dirname(file);
        return minify(src, options);
      }).join('');

      if (min.length === 0) {
        return grunt.log.warn('Destination not written because minified CSS was empty.');
      }

      if (options.banner) {
        min = options.banner + grunt.util.linefeed + min;
      }

      grunt.file.write(file.dest, min);

      grunt.log.writeln('File ' + chalk.cyan(file.dest) + ' created: ' + maxmin(max, min, options.report === 'gzip'));
    });
  });
};
