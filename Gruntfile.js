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
      },
      redirect: {
        site: 'localhost',
        options: {
          force: true,
          checkRedirect: true,
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
          base: 'test/fixtures',
          port: '<%= linkChecker.all.options.initialPort %>',
          middleware: function(connect, options, middlewares) {
            var modRewrite = require('connect-modrewrite');
            middlewares.unshift(modRewrite(['^/index3.html$ /index2.html [R=301,L]']));
            return middlewares;
          }
        }
      }
    }

  });

  grunt.registerTask('default', 'test');
  grunt.registerTask('test', ['jshint', 'connect', 'linkChecker']);
  grunt.loadTasks('tasks');

};
