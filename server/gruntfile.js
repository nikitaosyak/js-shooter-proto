module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            files: ["src/*.js", "!src/shared.gen.js"]
        },
        run: {
            node_server: {
                options: {
                    wait: true
                },
                args: ['./src/main.js']
            }
        },
        watch: {
            scripts: {
                files: ["src/*.*"],
                tasks: ['jshint', 'run:node_server'],
                options: {
                    spawn: true,
                    interrupt: true,
                    reload: true,
                    atBegin: true
                },
            },
        },
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-run');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['watch']);
}