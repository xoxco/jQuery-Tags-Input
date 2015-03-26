var mock = require('mock-fs');

var assert = require('../helper').assert;
var util = require('../../lib/util');


describe('util', function() {

  function nullOverride(filePath, time, include) {
    include(false);
  }

  describe('filterPathsByTime()', function() {

    beforeEach(function() {
      mock({
        src: {
          js: {
            'a.js': mock.file({
              mtime: new Date(100)
            }),
            'b.js': mock.file({
              mtime: new Date(200)
            }),
            'c.js': mock.file({
              mtime: new Date(300)
            })
          }
        }
      });
    });
    afterEach(mock.restore);

    it('calls callback with files newer than provided time', function(done) {

      var paths = [
        'src/js/a.js',
        'src/js/b.js',
        'src/js/c.js'
      ];

      util.filterPathsByTime(paths, new Date(150), nullOverride,
          function(err, results) {
        if (err) {
          return done(err);
        }
        assert.equal(results.length, 2);
        assert.deepEqual(results.sort(), ['src/js/b.js', 'src/js/c.js']);
        done();
      });

    });

    it('calls override with older files and comparison time', function(done) {

      var paths = [
        'src/js/a.js',
        'src/js/b.js',
        'src/js/c.js'
      ];

      function customOverride(filePath, time, include) {
        assert.equal(filePath, 'src/js/a.js');
        assert.equal(time.getTime(), 150);
        include(false);
      }

      util.filterPathsByTime(paths, new Date(150), customOverride,
          function(err, results) {
        if (err) {
          return done(err);
        }
        assert.equal(results.length, 2);
        assert.deepEqual(results.sort(), ['src/js/b.js', 'src/js/c.js']);
        done();
      });

    });

    it('allows override to force inclusion of older files', function(done) {

      var paths = [
        'src/js/a.js',
        'src/js/b.js',
        'src/js/c.js'
      ];

      function customOverride(filePath, time, include) {
        assert.equal(filePath, 'src/js/a.js');
        assert.equal(time.getTime(), 150);
        include(true);
      }

      util.filterPathsByTime(paths, new Date(150), customOverride,
          function(err, results) {
        if (err) {
          return done(err);
        }
        assert.equal(results.length, 3);
        assert.deepEqual(results.sort(),
            ['src/js/a.js', 'src/js/b.js', 'src/js/c.js']);
        done();
      });

    });

    it('calls callback error if file not found', function(done) {

      var paths = [
        'src/bogus-file.js'
      ];

      util.filterPathsByTime(paths, new Date(150), nullOverride,
          function(err, results) {
        assert.instanceOf(err, Error);
        assert.equal(results, undefined);
        done();
      });

    });

  });

  describe('anyNewer()', function() {

    beforeEach(function() {
      mock({
        src: {
          js: {
            'a.js': mock.file({
              mtime: new Date(100)
            }),
            'b.js': mock.file({
              mtime: new Date(200)
            }),
            'c.js': mock.file({
              mtime: new Date(300)
            })
          }
        }
      });
    });
    afterEach(mock.restore);

    var paths = [
      'src/js/a.js',
      'src/js/b.js',
      'src/js/c.js'
    ];

    it('calls callback with true if any file is newer', function(done) {
      util.anyNewer(paths, new Date(250), nullOverride, function(err, newer) {
        if (err) {
          return done(err);
        }
        assert.isTrue(newer);
        done();
      });
    });

    it('does not call override if all files are newer', function(done) {
      function override(filePath, time, include) {
        done(new Error('Override should not be called'));
      }

      util.anyNewer(paths, new Date(1), override, function(err, newer) {
        if (err) {
          return done(err);
        }
        assert.isTrue(newer);
        done();
      });
    });

    it('calls callback with false if no files are newer', function(done) {
      util.anyNewer(paths, new Date(350), nullOverride, function(err, newer) {
        if (err) {
          return done(err);
        }
        assert.isFalse(newer);
        done();
      });
    });

    it('calls override with older file and time', function(done) {
      function override(filePath, time, include) {
        assert.equal(filePath, 'src/js/a.js');
        assert.equal(time.getTime(), 150);
        include(false);
      }

      util.anyNewer(paths, new Date(150), override, function(err, newer) {
        if (err) {
          return done(err);
        }
        assert.isTrue(newer);
        done();
      });
    });

    it('allows override to force inclusion of older files', function(done) {
      function override(filePath, time, include) {
        include(true);
      }

      util.anyNewer(paths, new Date(1000), override, function(err, newer) {
        if (err) {
          return done(err);
        }
        assert.isTrue(newer);
        done();
      });
    });

    it('calls callback with error if file not found', function(done) {
      util.anyNewer(['bogus/file.js'], new Date(350), nullOverride,
          function(err, newer) {
        assert.instanceOf(err, Error);
        assert.equal(newer, undefined);
        done();
      });
    });

  });

  describe('filterFilesByTime()', function() {

    beforeEach(function() {
      mock({
        src: {
          js: {
            'a.js': mock.file({
              mtime: new Date(100)
            }),
            'b.js': mock.file({
              mtime: new Date(200)
            }),
            'c.js': mock.file({
              mtime: new Date(300)
            })
          },
          less: {
            'one.less': mock.file({mtime: new Date(100)}),
            'two.less': mock.file({mtime: new Date(200)})
          }
        },
        dest: {
          js: {
            'abc.min.js': mock.file({
              mtime: new Date(200)
            })
          },
          css: {
            'one.css': mock.file({mtime: new Date(100)}),
            'two.css': mock.file({mtime: new Date(150)})
          }
        }
      });
    });
    afterEach(mock.restore);

    it('compares to previous time if src & dest are same (a)', function(done) {
      var files = [{
        src: ['src/js/a.js'],
        dest: 'src/js/a.js'
      }];
      util.filterFilesByTime(files, new Date(50), nullOverride,
          function(err, results) {
        assert.isNull(err);
        assert.equal(results.length, 1);
        var result = results[0];
        assert.equal(result.dest, 'src/js/a.js');
        assert.deepEqual(result.src, files[0].src);
        done();
      });
    });

    it('compares to previous time if src & dest are same (b)', function(done) {
      var files = [{
        src: ['src/js/a.js'],
        dest: 'src/js/a.js'
      }];
      util.filterFilesByTime(files, new Date(150), nullOverride,
          function(err, results) {
        assert.isNull(err);
        assert.equal(results.length, 0);
        done();
      });
    });

    it('compares to previous time if src & dest are same (c)', function(done) {
      var files = [{
        src: ['src/js/a.js'],
        dest: 'src/js/a.js'
      }, {
        src: ['src/js/b.js'],
        dest: 'src/js/b.js'
      }];
      util.filterFilesByTime(files, new Date(50), nullOverride,
          function(err, results) {
        assert.isNull(err);
        assert.equal(results.length, 2);
        var first = results[0];
        assert.equal(first.dest, 'src/js/a.js');
        assert.deepEqual(first.src, files[0].src);
        var second = results[1];
        assert.equal(second.dest, 'src/js/b.js');
        assert.deepEqual(second.src, files[1].src);
        done();
      });
    });

    it('provides all files if any is newer than dest', function(done) {
      var files = [{
        src: ['src/js/a.js', 'src/js/b.js', 'src/js/c.js'],
        dest: 'dest/js/abc.min.js'
      }];
      util.filterFilesByTime(files, new Date(1000), nullOverride,
          function(err, results) {
        assert.isNull(err);
        assert.equal(results.length, 1);
        var result = results[0];
        assert.equal(result.dest, 'dest/js/abc.min.js');
        assert.equal(result.src.length, 3);
        assert.deepEqual(result.src.sort(), files[0].src);
        done();
      });
    });

    it('provides all files if dest does not exist', function(done) {
      var files = [{
        src: ['src/js/a.js', 'src/js/b.js', 'src/js/c.js'],
        dest: 'dest/js/foo.min.js'
      }];
      util.filterFilesByTime(files, new Date(1000), nullOverride,
          function(err, results) {
        assert.isNull(err);
        assert.equal(results.length, 1);
        var result = results[0];
        assert.equal(result.dest, 'dest/js/foo.min.js');
        assert.equal(result.src.length, 3);
        assert.deepEqual(result.src.sort(), files[0].src);
        done();
      });
    });

    it('provides newer src files if same as dest', function(done) {
      var files = [{
        src: ['src/js/a.js'],
        dest: 'src/js/a.js'
      }, {
        src: ['src/js/b.js'],
        dest: 'src/js/b.js'
      }, {
        src: ['src/js/c.js'],
        dest: 'src/js/c.js'
      }];
      util.filterFilesByTime(files, new Date(150), nullOverride,
          function(err, results) {
        assert.isNull(err);
        assert.equal(results.length, 2);
        var first = results[0];
        assert.equal(first.dest, 'src/js/b.js');
        assert.equal(first.src.length, 1);
        assert.deepEqual(first.src, files[1].src);
        var second = results[1];
        assert.equal(second.dest, 'src/js/c.js');
        assert.equal(second.src.length, 1);
        assert.deepEqual(second.src, files[2].src);
        done();
      });
    });

    it('provides files newer than previous if no dest', function(done) {
      var files = [{
        src: ['src/js/a.js', 'src/js/b.js', 'src/js/c.js']
      }];
      util.filterFilesByTime(files, new Date(200), nullOverride,
          function(err, results) {
        assert.isNull(err);
        assert.equal(results.length, 1);
        var result = results[0];
        assert.isUndefined(result.dest);
        assert.deepEqual(result.src, ['src/js/c.js']);
        done();
      });
    });

    it('provides only newer files for multiple file sets', function(done) {
      var files = [{
        src: ['src/less/one.less'],
        dest: 'dest/css/one.css'
      }, {
        src: ['src/less/two.less'],
        dest: 'dest/css/two.css'
      }];
      util.filterFilesByTime(files, new Date(1000), nullOverride,
          function(err, results) {
        assert.isNull(err);
        assert.equal(results.length, 1);
        var result = results[0];
        assert.equal(result.dest, 'dest/css/two.css');
        assert.deepEqual(result.src, ['src/less/two.less']);
        done();
      });
    });

    it('provides an error for a bogus src path', function(done) {
      var files = [{
        src: ['src/less/bogus.less'],
        dest: 'dest/css/one.css'
      }];
      util.filterFilesByTime(files, new Date(1000), nullOverride,
          function(err, results) {
        assert.instanceOf(err, Error);
        assert.isUndefined(results);
        done();
      });
    });

  });

});
