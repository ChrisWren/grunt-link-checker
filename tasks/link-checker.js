/*
 * grunt-link-checker
 * https://github.com/ChrisWren/grunt-link-checker
 *
 * Copyright (c) 2014 Chris Wren and contributors
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
  'use strict';
  grunt.registerMultiTask('link-checker', 'Checks your site for broken links after a build.', function () {

    var done = this.async();
    var options = this.options();
    var errors = false;
    var Crawler = require('simplecrawler');
    var crawler = new Crawler(this.data.site);

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
        done(!errors);
      });

    crawler.start();
  });
};
