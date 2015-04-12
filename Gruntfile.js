'use strict';

module.exports = function (grunt) {
  // Load any grunt plugins found in package.json.
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  grunt.initConfig({
    linkChecker: {
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
          port: '<%= linkChecker.all.options.initialPort %>',
          base: 'test/fixtures'
        }
      }
    }

  });

  grunt.registerTask('default', 'linkChecker');
  grunt.registerTask('test', ['jshint', 'connect', 'linkChecker']);
  grunt.loadTasks('tasks');

};
