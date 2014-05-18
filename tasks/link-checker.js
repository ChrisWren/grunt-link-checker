/*
 * grunt-link-checker
 * https://github.com/ChrisWren/grunt-link-checker
 *
 * Copyright (c) 2014 Chris Wren and contributors
 * Licensed under the MIT license.
 */

var Crawler = require('simplecrawler');
var cheerio = require('cheerio');

module.exports = function (grunt) {
  'use strict';
  grunt.registerMultiTask('link-checker', 'Checks your site for broken links after a build.', function () {

    var done = this.async();
    var options = this.options();
    var errors = false;
    var site = this.data.site;

    var crawler = new Crawler(site);

    Object.keys(options).forEach(function(key) {
      crawler[key] = options[key];
    });
    crawler
      .on('fetch404',function(queueItem) {
        errors = true;
        grunt.log.error('Resource not found while at ' + queueItem.referrer + ':', queueItem.url);
      })
      .on('fetcherror', function(queueItem) {
        errors = true;
        grunt.log.error('Trouble fetching the following resource while at ' + queueItem.referrer + ':', queueItem.url);
      })
      .on('fetchtimeout', function(queueItem) {
        errors = true;
        grunt.log.error('Timeout fetching the following resource while at ' + queueItem.referrer + ':', queueItem.url);
      })
      .on('fetchclienterror', function(queueItem) {
        grunt.log.error('Client error fetching the following resource while at ' + queueItem.referrer + ':', queueItem.url);
        errors = true;
      })
      .on('complete', function() {
        if (!errors) {
          grunt.log.ok('No broken links found at: ' + site);
        }
        done(!errors);
      })
      .on('fetchcomplete', function(queueItem, responseBuffer) {
        grunt.log.debug('Fetched: ' + queueItem.url);
        var html = responseBuffer.toString();
        var $ = cheerio.load(html);

        $('a[href*="#"]').each(function(i, anchor) {
          crawler.queueURL($(anchor).attr('href'));
        });

        if (queueItem.url.indexOf('#') !== -1) {
          if ($(queueItem.url.slice(queueItem.url.indexOf('#'))).length === 0) {
            grunt.log.error('Error finding content with the following id while at ' + queueItem.url);
            errors = true;
          }
        }
      });

    crawler.start();
  });
};
