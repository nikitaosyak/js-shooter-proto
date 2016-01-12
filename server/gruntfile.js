module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            files: ["src/*.js", "!src/shared.gen.js"]
        },
        run_node: {
            start: {
                cwd: 'src',
                options: {
                    stdio: [0, 1, 2]
                },
                files: { src: ['src/main.js']}
            }
        },
        stop_node: {
            stop: {}
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
                //tasks: ['jshint', 'run:node_server'],
                tasks: ['jshint', 'stop_node', 'run_node'],
                options: {
                    spawn: false,
                    // interrupt: true,
                    // reload: true,
                    atBegin: true
                },
            },
        },
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-run');
    grunt.loadNpmTasks('grunt-run-node');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['watch']);
}