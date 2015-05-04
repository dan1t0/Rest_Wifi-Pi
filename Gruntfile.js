'use strict';

var JS_FILES = ['Gruntfile.js', '*.js'];


module.exports = function (grunt) {

    // Load all Grunt tasks at once
    require('load-grunt-tasks')(grunt);
    // Display the elapsed execution time
    require('time-grunt')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            all: JS_FILES,
            options: {
                jshintrc: true,
                reporter: require('jshint-stylish')
            }
        },
        jscs: {
            src: JS_FILES,
            options: {
                config: '.jscsrc',
                reporter: require('jscs-stylish').path
            }
        },
        retire: {
            js: [],
            node: ['./'],
            options: {
                verbose: true,
                packageOnly: true,
                jsRepository: 'https://raw.github.com/bekk/retire.js/master/repository/jsrepository.json',
                nodeRepository: 'https://raw.github.com/bekk/retire.js/master/repository/npmrepository.json'
            }
        }
    });


    // Aliases

    grunt.task.registerTask('contribute', ['jshint', 'jscs']);

};
