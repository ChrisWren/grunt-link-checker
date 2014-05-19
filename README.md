# grunt-link-checker

> Run [node-simple-crawler](https://github.com/cgiffard/node-simplecrawler) to discover broken links on your website

[![NPM version](https://badge.fury.io/js/grunt-link-checker.png)](http://badge.fury.io/js/grunt-link-checker) [![Dependency Status](https://david-dm.org/ChrisWren/grunt-link-checker.png)](https://david-dm.org/ChrisWren/grunt-link-checker) [![Travis Status](https://travis-ci.org/ChrisWren/grunt-link-checker.png)](https://travis-ci.org/ChrisWren/grunt-link-checker)

## Getting Started
If you haven't used grunt before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a gruntfile as well as install and use grunt plugins. Once you're familiar with that process, install this plugin with this command:
```shell
npm install grunt-link-checker --save-dev
```

Then add this line to your project's `Gruntfile.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-link-checker');
```

## Documentation

### Minimal Usage
The minimal usage of grunt-link-checker runs with a `site` specified:

```js
'link-checker': {
  dev: {
    site: 'example.com'
  }
}
```

### Custom options

#### noFragment
Type: `Boolean` Default: `false`
Set this to true to speed up your test by not verfiying fragments.

### simple-crawler options
Every option specified in the node-simplecrawler is available:

https://github.com/cgiffard/node-simplecrawler#configuring-the-crawler

## Changelog

**0.0.2** - Added `noFragment` flag.

**0.0.1** - Check to make sure `#` URLs resolve to content with a corresponding id.

**0.0.0** - Initial release
