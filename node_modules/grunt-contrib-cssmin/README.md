# grunt-contrib-cssmin v0.10.0 [![Build Status: Linux](https://travis-ci.org/gruntjs/grunt-contrib-cssmin.png?branch=master)](https://travis-ci.org/gruntjs/grunt-contrib-cssmin) <a href="https://ci.appveyor.com/project/gruntjs/grunt-contrib-cssmin"><img src="https://ci.appveyor.com/api/projects/status/ntgfqc3ppk533m84/branch/master" alt="Build Status: Windows" height="18" /></a>

> Compress CSS files.



## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-contrib-cssmin --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-contrib-cssmin');
```

*This plugin was designed to work with Grunt 0.4.x. If you're still using grunt v0.3.x it's strongly recommended that [you upgrade](http://gruntjs.com/upgrading-from-0.3-to-0.4), but in case you can't please use [v0.3.2](https://github.com/gruntjs/grunt-contrib-cssmin/tree/grunt-0.3-stable).*



## Cssmin task
_Run this task with the `grunt cssmin` command._

Task targets, files and options may be specified according to the grunt [Configuring tasks](http://gruntjs.com/configuring-tasks) guide.

Files are compressed with [clean-css](https://github.com/GoalSmashers/clean-css).
### Options

#### banner

Type: `String`  
Default: `null`

Prefix the compressed source with the given banner, with a linebreak inbetween.

#### keepSpecialComments

Type: `String` `Number`  
Default: `'*'`

To keep or remove special comments, exposing the underlying option from [clean-css](https://github.com/GoalSmashers/clean-css). `'*'` for keeping all (default), `1` for keeping first one, `0` for removing all.

#### report
Choices: `'min'`, `'gzip'`  
Default: `'min'`

Either report only minification result or report minification and gzip results.
This is useful to see exactly how well clean-css is performing but using `'gzip'` will make the task take 5-10x longer to complete. [Example output](https://github.com/sindresorhus/maxmin#readme).

### Usage Examples

#### Combine two files into one output file

```js
cssmin: {
  combine: {
    files: {
      'path/to/output.css': ['path/to/input_one.css', 'path/to/input_two.css']
    }
  }
}
```

#### Add a banner
```js
cssmin: {
  add_banner: {
    options: {
      banner: '/* My minified css file */'
    },
    files: {
      'path/to/output.css': ['path/to/**/*.css']
    }
  }
}
```

#### Minify all contents of a release directory and add a `.min.css` extension
```js
cssmin: {
  minify: {
    expand: true,
    cwd: 'release/css/',
    src: ['*.css', '!*.min.css'],
    dest: 'release/css/',
    ext: '.min.css'
  }
}
```


## Release History

 * 2014-06-11   v0.10.0   update clean-css v2.2.0
 * 2014-02-01   v0.9.0   refactor. remove grunt-lib-contrib dependency. backwards-compatibly remove `false` choice from `report`.
 * 2014-02-14   v0.8.0   update clean-css v2.1.0
 * 2013-11-23   v0.7.0   update clean-css v2.0.0
 * 2013-09-14   v0.6.2   Support relative URLs via clean-css ~1.1.1.
 * 2013-05-25   v0.6.1   Support import in-lining vis clean-css ~1.0.4.
 * 2013-04-05   v0.6.0   Update clean-css dependency to ~1.0.0
 * 2013-03-14   v0.5.0   Support for 'report' option (false by default)
 * 2013-03-10   v0.4.2   Add banner option Support clean-css keepSpecialComments
 * 2013-02-17   v0.4.1   Update clean-css dependency to ~0.10.0
 * 2013-02-15   v0.4.0   First official release for Grunt 0.4.0.
 * 2013-01-23   v0.4.0rc7   Updating grunt/gruntplugin dependencies to rc7. Changing in-development grunt/gruntplugin dependency versions from tilde version ranges to specific versions.
 * 2013-01-09   v0.4.0rc5   Updating to work with grunt v0.4.0rc5. Switching to this.files api.
 * 2012-11-01   v0.3.2   Update clean-css dep.
 * 2012-10-12   v0.3.1   Rename grunt-contrib-lib dep to grunt-lib-contrib.
 * 2012-09-23   v0.3.0   Options no longer accepted from global config key.
 * 2012-09-10   v0.2.0   Refactored from grunt-contrib into individual repo.

---

Task submitted by [Tim Branyen](http://tbranyen.com/)

*This file was generated on Wed Jun 11 2014 23:05:14.*
