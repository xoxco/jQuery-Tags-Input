# grunt-newer

Configure [Grunt](http://gruntjs.com/) tasks to run with newer files only.

**Synopsis:**  The [`newer`](#newer) task will configure another task to run with `src` files that are *a)* newer than the `dest` files or *b)* newer than the last successful run (if there are no `dest` files).  See below for examples and more detail.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [`gruntfile.js`](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-newer --save-dev
```

Once the plugin has been installed, it may be enabled inside your `gruntfile.js` with this line:

```js
grunt.loadNpmTasks('grunt-newer');
```

<a name="newer"></a>
## The `newer` task

The `newer` task doesn't require any special configuration.  To use it, just add `newer` as the first argument when running other tasks.

For example, if you want to use [Uglify](https://npmjs.org/package/grunt-contrib-uglify) to minify your source files only when one or more of them is newer than the previously minified destination file, configure the `uglify` task as you would otherwise, and then register a task with `newer` at the front.

```js
  grunt.initConfig({
    uglify: {
      all: {
        files: {
          'dest/app.min.js': ['src/**/*.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-newer');

  grunt.registerTask('minify', ['newer:uglify:all']);
```

With the above configuration the `minify` task will only run `uglify` if one or more of the `src/**/*.js` files is newer than the `dest/app.min.js` file.

The above example shows how the `newer` task works with other tasks that specify both `src` and `dest` files.  In this case, the modification time of `src` files are compared to modification times of corresponding `dest` files to determine which `src` files to include.

The `newer` task can also be used with tasks that don't generate any `dest` files.  In this case, `newer` will only use files that are newer than the last successful run of the same task.

For example, if you want to run [JSHint](https://npmjs.org/package/grunt-contrib-jshint) on only those files that have been modified since the last successful run, configure the `jshint` task as you would otherwise, and then register a task with `newer` at the front.

```js
  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: {
        src: 'src/**/*.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-newer');

  grunt.registerTask('lint', ['newer:jshint:all']);
```

With the above configuration, running `grunt lint` will configure your `jshint:all` task to use only files in the `jshint.all.src` config that have been modified since the last successful run of the same task.  The first time the `jshint:newer:all` task runs, all source files will be used.  After that, only the files you modify will be run through the linter.

Another example is to use the `newer` task in conjunction with `watch`.  For example, you might want to set up a watch to run a linter on all your `.js` files whenever one changes.  With the `newer` task, instead of re-running the linter on all files, you only need to run it on the files that changed.

```js
  var srcFiles = 'src/**/*.js';

  grunt.initConfig({
    jshint: {
      all: {
        src: srcFiles
      }
    },
    watch: {
      all: {
        files: srcFiles,
        tasks: ['newer:jshint:all']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-newer');

```

With the above configuration, running `grunt jshint watch` will first lint all your files with `jshint` and then set up a watch.  Whenever one of your source files changes, the `jshint` task will be run on just the modified file.

*Note:* If your task is configured with `dest` files, `newer` will run your task with only those files that are newer than the corresponding `dest` files.

## Options for the `newer` task

In most cases, you shouldn't need to add any special configuration for the `newer` task.  Just `grunt.loadNpmTasks('grunt-newer')` and you can use `newer` as a prefix to your other tasks.  The options below are available for advanced usage.

#### <a id="optionscache">options.cache</a>
 * type: `string`
 * default: `node_modules/grunt-newer/.cache`

To keep track of timestamps for successful runs, the `newer` task writes to a cache directory.  The default is to use a `.cache` directory within the `grunt-newer` installation directory.  If you need timestamp info to be written to a different location, configure the task with a `cache` option.

Example use of the `cache` option:

```js
  grunt.initConfig({
    newer: {
      options: {
        cache: 'path/to/custom/cache/directory'
      }
    }
  });
```

#### <a id="optionsoverride">options.override</a>
 * type: `function(Object, function(boolean))`
 * default: `null`

The `newer` task determines which files to include for a specific task based on file modification time.  There are occassions where you may want to include a file even if it has not been modified.  For example, if a LESS file imports some other files, you will want to include it if any of the imports have been modified.  To support this, you can provide an `override` function that takes two arguments:

 * **details** - `Object`
   * **task** - `string` The currently running task name.
   * **target** - `string` The currently running target name.
   * **path** - `string` The path to a `src` file that appears to be "older" (not modified since the time below).
   * **time** - `Date` The comparison time.  For tasks with `dest` files, this is the modification time of the `dest` file.  For tasks without `dest` files, this is the last successful run time of the same task.
 * **include** - `function(boolean)` A callback that determines whether this `src` file should be included.  Call with `true` to include or `false` to exclude the file.

Example use of the `override` option:

```js
  grunt.initConfig({
    newer: {
      options: {
        override: function(detail, include) {
          if (detail.task === 'less') {
            checkForModifiedImports(detail.path, detail.time, include);
          } else {
            include(false);
          }
        }
      }
    }
  });
```

## That's it

Please [submit an issue](https://github.com/tschaub/grunt-newer/issues) if you encounter any trouble.  Contributions or suggestions for improvements welcome!

[![Current Status](https://secure.travis-ci.org/tschaub/grunt-newer.png?branch=master)](https://travis-ci.org/tschaub/grunt-newer)

## Known limitations

The `newer` task relies on Grunt's convention for specifying [`src`/`dest` mappings](http://gruntjs.com/configuring-tasks#files).  So it should be expected to work with two types of tasks:

1) Tasks that specify both `src` and `dest` files.  In this case, the task prefixed by `newer` will be configured to run with `src` files that are newer than the corresponding `dest` file (based on the `mtime` of files).

2) Tasks that specify only `src` files.  In this case, the task prefixed by `newer` will be configured to run with `src` files that are newer than the previous successful run of the same task.

The `newer` task will *not* work as a prefix for the following tasks:

 * [`grunt-rsync`](http://npmjs.org/package/grunt-rsync) - Though this task specifies `src` and `dest` files, the `dest` file is not generated based on `src` files (instead it is a directory).

 * [`grunt-spritesmith`](https://npmjs.org/package/grunt-spritesmith) - This task uses multiple `src` images to produce `destImg` and `destCSS` files.  Instead use the [`grunt-spritely`](https://npmjs.org/package/grunt-spritely) task configured with `src` and `dest` files.
