console.log('isMaster');
console.log(process.env.TRAVIS_BRANCH === 'master' && process.env.TRAVIS_PULL_REQUEST === 'false');


console.log('MASTER');
console.log(process.env.TRAVIS_BRANCH === 'master');

console.log('Type of pull');
console.log(typeof process.env.TRAVIS_PULL_REQUEST);

console.log(process.env.TRAVIS_PULL_REQUEST);

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
        src:  ['*.js', 'tasks/*.js']
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
