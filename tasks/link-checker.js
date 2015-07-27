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
var _ = require('underscore');
var xmlWriter = require('libxmljs');

var capture = function(captureFiles, content) {
  var files = _.pick(captureFiles, ['json', 'xml']);
  var file;
  _.each(files, function(value, key) {
    try {
      mkdirpSync(path.dirname(value));
      file = fs.openSync(value, 'w');
      if (file) {
        switch (key) {
          case 'json':
            fs.writeSync(file, JSON.stringify(content, null, 2));
            break;

          case 'xml':
            var doc = new xmlWriter.Document();
            var testsuite = doc.node('testsuite').attr({
              name: 'Link Checker',
              tests: content.stats.tests,
              failures: content.stats.failures,
              errors: content.stats.failures,
              skipped: content.stats.pending,
              timestamp: content.stats.start,
              time: content.stats.duration / 1000
            });
            _.each(content.tests, function(test) {
              if (test.err) {
                testsuite.node('testcase').attr({
                  classname: test.title,
                  name: test.fullTitle,
                  time: test.duration / 1000,
                  message: test.err.stack
                }).node('failure').attr({
                  classname: test.title,
                  name: test.fullTitle,
                  time: test.duration / 1000,
                  message: test.err.stack
                });
              } else {
                testsuite.node('testcase').attr({
                  classname: test.title,
                  name: test.fullTitle,
                  time: test.duration / 1000
                });
              }
            });
            fs.writeSync(file, doc.toString());
            break;

          default:
            break;
        }
      }
    } finally {
      // close the file if it was opened
      if (file) {
        fs.closeSync(file);
      }
    }
  });
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
      failures: [],
      passes: []
    };
    var startTime;

    grunt.log.ok('Checking for broken links at: ' + site + (options.initialPort ? ':' + options.initialPort : ''));
    var crawler = new Crawler(site);

    Object.keys(options).forEach(function(key) {
      crawler[key] = options[key];
    });
    crawler
      .on('fetch404', function(queueItem, response) {
        result.tests.push({
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
        result.tests.push({
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
        result.tests.push({
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
        result.tests.push({
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
        result.stats.tests = result.tests.length;
        result.failures = _.filter(result.tests, function(test) {
          return test.err;
        });
        result.passes = _.filter(result.tests, function(test) {
          return !test.err;
        });
        result.stats.failures = result.failures.length;
        result.stats.passes = result.passes.length;
        result.stats.end = new Date().getTime();
        result.stats.duration = result.stats.end - result.stats.start;
        if (!errors) {
          grunt.log.ok('No broken links found at: ' + site + (options.initialPort ? ':' + options.initialPort : ''));
        }
        // Record json result in a file
        if (options.resultFiles) {
          capture(options.resultFiles, result);
        }
        done(!errors);
      })
      .on('fetchcomplete', function(queueItem, responseBuffer) {
        result.tests.push({
          title: queueItem.url,
          fullTitle: queueItem.referrer + ' -> ' + queueItem.url,
          duration: (new Date().getTime() - startTime)
        });
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
        startTime = new Date().getTime();
      })
      .on('queueerror', function(errorData, URLData) {
        result.tests.push({
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
        result.tests.push({
          title: queueItem.url,
          fullTitle: queueItem.referrer + ' -> ' + queueItem.url,
          duration: (new Date().getTime() - startTime),
          err: {
            stack: 'Resource exceeds max size (16MB)'
          }
        });
        grunt.log.error('Resource exceeds max size (16MB): ' + queueItem.referrer + ' -> ' + queueItem.url);
      })
      .on('fetchredirect', function(queueItem) {
        result.tests.push({
          title: queueItem.url,
          fullTitle: queueItem.referrer + ' -> ' + queueItem.url,
          duration: (new Date().getTime() - startTime)
        });
      });
    if (options.callback) {
      options.callback(crawler);
    }
    result.stats.start = new Date().getTime();
    crawler.start();
  });
};
