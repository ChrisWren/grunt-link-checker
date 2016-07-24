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

module.exports = function (grunt) {
  grunt.registerMultiTask('linkChecker', 'Checks your site for broken links after a build.', function () {

    var done = this.async();
    var options = this.options();
    var errors = false;
    var site = this.data.site;
    var dotRE = /\./g;

    grunt.log.ok('Checking for broken links at: ' + site + (options.initialPort ? ':' + options.initialPort : ''));
    var crawler = new Crawler(site);

    Object.keys(options).forEach(function(key) {
      crawler[key] = options[key];
    });
    crawler
      .on('fetch404', function(queueItem, response) {
        errors = true;
        grunt.log.error('Resource not found linked from ' + chalk.cyan(queueItem.referrer) + ' to', chalk.magenta(queueItem.url));
        grunt.log.error('Status code: ' + response.statusCode);
      })
      .on('fetcherror', function(queueItem, response) {
        errors = true;
        grunt.log.error('Trouble fetching the following resource linked from ' + chalk.cyan(queueItem.referrer) + ' to', chalk.magenta(queueItem.url));
        grunt.log.error('Status code: ' + response.statusCode);
      })
      .on('fetchtimeout', function(queueItem) {
        errors = true;
        grunt.log.error('Timeout fetching the following resource linked from ' + chalk.cyan(queueItem.referrer) + ' to', chalk.magenta(queueItem.url));
      })
      .on('fetchclienterror', function(queueItem) {
        errors = true;
        if (!queueItem.referrer) {
          return grunt.log.error('Error fetching `site` URL: ' + chalk.magenta(queueItem.url));
        }
        grunt.log.error('Client error fetching the following resource linked from ' + queueItem.referrer ? chalk.cyan(queueItem.referrer) : site + ' to', chalk.magenta(queueItem.url));
      })
      .on('complete', function() {
        if (!errors) {
          grunt.log.ok('No broken links found at: ' + site + (options.initialPort ? ':' + options.initialPort : ''));
        }
        done(!errors);
      })
      .on('fetchcomplete', function(queueItem, responseBuffer) {
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
            if ($(queueItem.url.slice(queueItem.url.indexOf('#')).replace(dotRE, '\\.')).length === 0) {
              grunt.log.error('Error finding content with the following fragment identifier linked from ' + chalk.cyan(queueItem.referrer) + ' to', chalk.magenta(queueItem.url));
              errors = true;
            }
          } catch (e) {
            grunt.log.error('The following URL was formatted incorrectly linked from ' + chalk.cyan(queueItem.referrer) + ' to', chalk.magenta(queueItem.url));
            errors = true;
          }
        }
      });
    if (options.callback) {
      options.callback(crawler);
    }
    crawler.start();
  });
};
