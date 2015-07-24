/*
 * grunt-link-checker
 * https://github.com/ChrisWren/grunt-link-checker
 *
 * Copyright (c) 2014 Chris Wren and contributors
 * Licensed under the MIT license.
 */

'use strict';

var Crawler = require('simplecrawler');
var cheerio = require('cheerio');
var chalk = require('chalk');
var fs = require('fs');
var mkdirpSync = require('mkdirp').sync;
var path = require('path');

var capture = function(captureFile, content) {
  var file;
  try {
    mkdirpSync(path.dirname(captureFile));
    file = fs.openSync(captureFile, 'w');
    if (file) {
      fs.writeSync(file, JSON.stringify(content, null, 2));
    }
    // close the file if it was opened
  } finally {
    if (file) {
      fs.closeSync(file);
    }
  }
};

module.exports = function(grunt) {
  grunt.registerMultiTask('linkChecker', 'Checks your site for broken links after a build.', function() {

    var done = this.async();
    var options = this.options();
    var errors = false;
    var site = this.data.site;
    var result = {
      stats: {
        tests: 0,
        passes: 0,
        failures: 0,
        pending: 0
      },
      tests: [],
      failures: []
    };
    var startTime;

    grunt.log.ok('Checking for broken links at: ' + site + (options.initialPort ? ':' + options.initialPort : ''));
    var crawler = new Crawler(site);

    Object.keys(options).forEach(function(key) {
      crawler[key] = options[key];
    });
    crawler
      .on('fetch404', function(queueItem, response) {
        result.failures.push({
          title: queueItem.url,
          fullTitle: queueItem.referrer + ' -> ' + queueItem.url,
          duration: (new Date().getTime() - startTime),
          err: {
            stack: 'Status code: ' + response.statusCode
          }
        });
        errors = true;
        grunt.log.error('Resource not found linked from ' + chalk.cyan(queueItem.referrer) + ' to', chalk.magenta(queueItem.url));
        grunt.log.error('Status code: ' + response.statusCode);
      })
      .on('fetcherror', function(queueItem, response) {
        result.failures.push({
          title: queueItem.url,
          fullTitle: queueItem.referrer + ' -> ' + queueItem.url,
          duration: (new Date().getTime() - startTime),
          err: {
            stack: 'Status code: ' + response.statusCode
          }
        });
        errors = true;
        grunt.log.error('Trouble fetching the following resource linked from ' + chalk.cyan(queueItem.referrer) + ' to', chalk.magenta(queueItem.url));
        grunt.log.error('Status code: ' + response.statusCode);
      })
      .on('fetchtimeout', function(queueItem) {
        result.failures.push({
          title: queueItem.url,
          fullTitle: queueItem.referrer + ' -> ' + queueItem.url,
          duration: (new Date().getTime() - startTime),
          err: {
            stack: 'Request timeout'
          }
        });
        errors = true;
        grunt.log.error('Timeout fetching the following resource linked from ' + chalk.cyan(queueItem.referrer) + ' to', chalk.magenta(queueItem.url));
      })
      .on('fetchclienterror', function(queueItem) {
        result.failures.push({
          title: queueItem.url,
          fullTitle: queueItem.referrer + ' -> ' + queueItem.url,
          duration: (new Date().getTime() - startTime),
          err: {
            stack: 'Error fetching from ' + queueItem.referrer + ' to ' + queueItem.url
          }
        });
        errors = true;
        if (!queueItem.referrer) {
          return grunt.log.error('Error fetching `site` URL: ' + chalk.magenta(queueItem.url));
        }
        grunt.log.error('Client error fetching the following resource linked from ' + queueItem.referrer ? chalk.cyan(queueItem.referrer) : site + ' to', chalk.magenta(queueItem.url));
      })
      .on('complete', function() {
        result.stats.failures = result.failures.length;
        result.tests = result.failures;
        result.stats.end = new Date().getTime();
        result.stats.duration = result.stats.end - result.stats.start;
        if (!errors) {
          grunt.log.ok('No broken links found at: ' + site + (options.initialPort ? ':' + options.initialPort : ''));
        }
        // Record json result in a file
        if (options.resultFile) {
          capture(options.resultFile, result);
        }
        done(!errors);
      })
      .on('fetchcomplete', function(queueItem, responseBuffer) {
        result.stats.passes++;
        grunt.log.debug('Fetched: ' + queueItem.url);
        if (options.noFragment) {
          return;
        }
        var html = responseBuffer.toString();
        var $ = cheerio.load(html);

        $('a[href*="#"]').each(function(i, anchor) {
          crawler.queueURL($(anchor).attr('href'), queueItem);
        });

        if (queueItem.url.indexOf('#') !== -1) {
          try {
            if ($(queueItem.url.slice(queueItem.url.indexOf('#'))).length === 0) {
              grunt.log.error('Error finding content with the following fragment identifier linked from ' + chalk.cyan(queueItem.referrer) + ' to', chalk.magenta(queueItem.url));
              errors = true;
            }
          } catch (e) {
            grunt.log.error('The following URL was formatted incorrectly linked from ' + chalk.cyan(queueItem.referrer) + ' to', chalk.magenta(queueItem.url));
            errors = true;
          }
        }
      })
      .on('fetchstart', function() {
        result.stats.tests++;
        startTime = new Date().getTime();
      })
      .on('queueerror', function(errorData, URLData) {
        result.failures.push({
          title: URLData,
          fullTitle: URLData,
          duration: (new Date().getTime() - startTime),
          err: {
            stack: errorData
          }
        });
        grunt.log.error('Queue error happened for url: ' + URLData);
      })
      .on('fetchdataerror', function(queueItem) {
        result.failures.push({
          title: queueItem.url,
          fullTitle: queueItem.referrer + ' -> ' + queueItem.url,
          duration: (new Date().getTime() - startTime),
          err: {
            stack: 'Resource exceeds max size (16MB)'
          }
        });
        grunt.log.error('Resource exceeds max size (16MB): ' + queueItem.referrer + ' -> ' + queueItem.url);
      })
      .on('fetchredirect', function(queueItem, parsedURL) {
        result.stats.passes++;
      });
    if (options.callback) {
      options.callback(crawler);
    }
    result.stats.start = new Date().getTime();
    crawler.start();
  });
};
