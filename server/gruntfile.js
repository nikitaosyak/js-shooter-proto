module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            files: ["src/*.js", "!src/shared.gen.js"]
        },
        run_node: {
            start: {
                options: {
                    stdio: [0, 1, 2],
                },
                files: { 
                    src: ['src/main.js'],
                },
            },
        },
        stop_node: {
            stop: {}
        },
        watch: {
            scripts: {
                files: "src/*.*",
                tasks: ['default'],
                options: {
                    spawn: false,
                    atBegin: true,
                },
            },
        },
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-run-node');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['stop_node', 'jshint', 'run_node']);
}