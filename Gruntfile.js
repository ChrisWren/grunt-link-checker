'use strict';

module.exports = function (grunt) {
  // Load any grunt plugins found in package.json.
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  grunt.initConfig({
    'link-checker': {
      all: {
        site: 'localhost',
        options: {
          initialPort: 9001
        }
      }
    },

    jshint: {
      options: {
        jshintrc: true
      },
      files: {
        src: ['Gruntfile.js', 'tasks/*.js']
      }
    },

    connect: {
      server: {
        options: {
          port: 9001,
          base: 'test/fixtures'
        }
      }
    }

  });

  grunt.registerTask('default', 'link-checker');
  grunt.registerTask('test', ['jshint', 'connect', 'link-checker']);
  grunt.loadTasks('tasks');

};
