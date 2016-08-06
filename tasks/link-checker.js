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
    var site = this.data.site || options.site;
    var dotRE = /\./g;

    // Borrowed from grunt-contrib-qunit
    // If options.force then log an error, otherwise exit with a warning
    var warnUnlessForced = function (message) {
      if (options.force) {
        grunt.log.error(message);
      } else {
        grunt.warn(message);
      }
    };

    grunt.log.ok('Checking for broken links at: ' + site + (options.initialPort ? ':' + options.initialPort : ''));
    var crawler = new Crawler(site);

    Object.keys(options).forEach(function(key) {
      crawler[key] = options[key];
    });
    crawler
      .on('fetch404', function(queueItem, response) {
        errors = true;
        warnUnlessForced('Resource not found linked from ' + chalk.cyan(queueItem.referrer) + ' to ' + chalk.magenta(queueItem.url));
        warnUnlessForced('Status code: ' + response.statusCode);
      })
      .on('fetcherror', function(queueItem, response) {
        errors = true;
        warnUnlessForced('Trouble fetching the following resource linked from ' + chalk.cyan(queueItem.referrer) + ' to ' + chalk.magenta(queueItem.url));
        warnUnlessForced('Status code: ' + response.statusCode);
      })
      .on('fetchtimeout', function(queueItem) {
        errors = true;
        warnUnlessForced('Timeout fetching the following resource linked from ' + chalk.cyan(queueItem.referrer) + ' to ' + chalk.magenta(queueItem.url));
      })
      .on('fetchclienterror', function(queueItem) {
        errors = true;
        if (!queueItem.referrer) {
          warnUnlessForced('Error fetching `site` URL: ' + chalk.magenta(queueItem.url));
        }
        warnUnlessForced('Client error fetching the following resource linked from ' + queueItem.referrer ? chalk.cyan(queueItem.referrer) : site + ' to ' + chalk.magenta(queueItem.url));
      })
      .on('fetchredirect', function(queueItem) {
        if (!options.checkRedirect) {
          return;
        }
        if (options.force) {
          errors = false;
        } else {
          errors = true;
        }
        warnUnlessForced('Redirect detected from ' + chalk.cyan(queueItem.url) + ' to ' + chalk.magenta(queueItem.stateData.headers.location));
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
              warnUnlessForced('Error finding content with the following fragment identifier linked from ' + chalk.cyan(queueItem.referrer) + ' to ' + chalk.magenta(queueItem.url));
              errors = true;
            }
          } catch (e) {
            warnUnlessForced('The following URL was formatted incorrectly linked from ' + chalk.cyan(queueItem.referrer) + ' to ' + chalk.magenta(queueItem.url));
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
