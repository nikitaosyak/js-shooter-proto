module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            files: ["src/*.js", "!src/shared.gen.js"]
        },
        run: {
            node_server: {
                options: {
                    wait: false
                },
                args: ['./src/main.js']
            }
        },
        watch: {
            scripts: {
                files: ["src/*.*"],
                tasks: ['jshint', 'stop:node_server', 'run:node_server'],
                options: {
                    spawn: false
                },
            },
        },
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-run-node');
    grunt.loadNpmTasks('grunt-run');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['jshint', 'run:node_server', 'watch']);
}