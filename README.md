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

grunt-link-checker will by default find any broken internal links on the given `site` and will also find broken [fragment identifiers](en.wikipedia.org/wiki/Fragment_identifier) by using [cheerio](https://github.com/cheeriojs/cheerio) to ensure that an element exists with the given identifier. You can figure more [options that are available via node-simplecrawler](https://github.com/cgiffard/node-simplecrawler#configuring-the-crawler).

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

### Recommended Usage
In addition to the above config which tests a local version of your site before deployment, you can add an additional target to run post-deployment. This will verify that your assets were deployed correctly and are being resolved correctly after any revisioning or path modifications during deployment:

```js
'link-checker': {
  // Use a large amount of concurrency to speed up check
  options: {
    maxConcurrency: 20
  },
  dev: {
    site: 'localhost',
    options: {
      initialPort: 9001
    }
  },
  postDeploy: {
    site: 'mysite.com'
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


Here is an example config using the `callback` option to ignore `localhost` links which have different ports:
```js
'link-checker': {
  dev: {
    site: 'localhost',
    options: {
      initialPort: 9001,
      callback: function(crawler) {
        crawler.addFetchCondition(function(url) {
            return url.port === '9001';
        });
      }
    }
  }
}
```
### simple-crawler options
Every option specified in the node-simplecrawler is available:

https://github.com/cgiffard/node-simplecrawler#configuring-the-crawler

## Changelog

**0.0.6** - Added logging for initially fetched URL and logged status codes for failed fetches.

**0.0.5** - Added error reporting if initial `site` URL fails.

**0.0.4** - Added `callback` option.

**0.0.3** - Fixed repo link in package.json and fixed error reporting for a failed initial URL.

**0.0.2** - Added `noFragment` flag.

**0.0.1** - Check to make sure `#` URLs resolve to content with a corresponding id.

**0.0.0** - Initial release
