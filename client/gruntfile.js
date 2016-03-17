
module.exports = function(grunt) {
    //noinspection JSUnresolvedFunction
    grunt.initConfig({
        jshint: {
            files: ["src/js/**/*.js", "!src/js/phaser.min.js", "!src/js/shared.gen.js"]
        },
        connect: {
            server: {
                options: {
                    livereload: true,
                    port: 8080,
                    base: './src/'
                }
            }
        },
        watch: {
            scripts: {
                files: ["src/js/**/*.js", "src/*.html", "gruntfile.js", "../server/src/*.js"],
                tasks: ['jshint'],
                options: {
                    spawn: false,
                    livereload: true,
                    reload: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-connect');    
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['jshint', 'connect', 'watch']);
};
