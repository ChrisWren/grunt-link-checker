module.exports = function (grunt) {
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  grunt.initConfig({
    'link-checker': {
      all: {
        site: 'example.com'
      }
    },
    mdlint: ['README.md'],
    jshint: {
      options: {
        jshintrc: true
      },
      files: {
        src:  ['*.js', 'tasks/*.js']
      }
    }
  });

  grunt.registerTask('default', ['link-checker']);
  grunt.registerTask('test', ['jshint', 'link-checker']);
  grunt.loadTasks('tasks');

};
