# grunt-link-checker

> Run [node-simple-crawler](https://github.com/cgiffard/node-simplecrawler) to discover broken links on your website.

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

grunt-link-checker will by default find any broken internal links on the given `site` and will also find broken fragment identifiers by using [cheerio](https://github.com/cheeriojs/cheerio) to ensure that an element exists with the given identifier. You can figure more [options that are available via node-simplecrawler](https://github.com/cgiffard/node-simplecrawler#configuring-the-crawler).

### Minimal Usage
The minimal usage of grunt-link-checker runs with a `site` specified and an optional `options.initialPort`:

```js
'link-checker': {
  dev: {
    site: 'localhost',
    options: {
      initialPort: 9001
    }
  }
}
```

### Custom options

#### noFragment
Type: `Boolean` Default: `false`

Set this to `true` to speed up your test by not verfiying [fragment identifiers](http://en.wikipedia.org/wiki/Fragment_identifier).

#### callback
Type: `Function`

Function that receives the instantiated `crawler` object so that you can add [events](https://github.com/cgiffard/node-simplecrawler#events) or other listeners/config to the crawler.

### simple-crawler options
Every option specified in the node-simplecrawler is available:

https://github.com/cgiffard/node-simplecrawler#configuring-the-crawler

## Changelog

**0.0.4** - Added `callback` option.

**0.0.3** - Fixed repo link in package.json and fixed error reporting for a failed initial URL.

**0.0.2** - Added `noFragment` flag.

**0.0.1** - Check to make sure `#` URLs resolve to content with a corresponding id.

**0.0.0** - Initial release
