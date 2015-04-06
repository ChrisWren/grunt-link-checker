module.exports = function (grunt) {
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  grunt.initConfig({
    'link-checker': {
      all: {
        site: 'localhost',
        options: {
          initialPort: 9001
        }
      }
    },
    mdlint: ['README.md'],
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

  grunt.registerTask('default', ['link-checker']);
  grunt.registerTask('test', ['jshint', 'connect', 'link-checker']);
  grunt.loadTasks('tasks');

};
