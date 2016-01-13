var isWindows = process.platform == 'win32';
var isLinux = process.platform == 'linux'

module.exports = function(grunt) {
    grunt.initConfig({
        if: {
            default: {
                options: {
                    test: function() {
                        return isLinux;
                    }
                },
                ifTrue: ['stop_node', 'run_node'],
                ifFalse: ['run:node_server']
            }
        },
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
                    wait: true
                },
                args: ['./src/main.js']
            }
        },
        watch: {
            scripts: {
                files: ["src/*.*"],
                tasks: ['jshint', 'if'],
                options: {
                    spawn: isWindows,
                    interrupt: isWindows,
                    reload: isWindows,
                    atBegin: true
                },
            },
        },
    });

    grunt.loadNpmTasks('grunt-if');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-run');
    grunt.loadNpmTasks('grunt-run-node');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['watch']);
}