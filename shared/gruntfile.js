
module.exports = function(grunt) {

    var libs = [
        'src/matter-0.8.0.js'
    ];

    var sources = [
        'src/GameParams.js', 
        'src/SharedUtils.js', 
        'src/SendMessage.js', 
        'src/LevelModel.js',
        'src/ShitCast.js',
        'src/simulation/timeline/InstantTimeline.js',
        'src/simulation/timeline/StreamTimeline.js',
        'src/simulation/action/*.js',
        'src/simulation/action/stream/*.js',
        'src/simulation/entities/Player.js',
        'src/simulation/entities/PlayerRegistry.js',
        'src/simulation/Physics.js',
        'src/simulation/Simulation.js'
    ];

    //noinspection JSUnresolvedFunction
    grunt.initConfig({
        jshint: {
            files: sources
        },
        uglify: {
            options: {
                banner: "/* SHARED LOGIC GENERATED (<%= grunt.template.today('dd-mm-yyyy') %>) */\n",
                beautify: true,
                mangle: false
            },
            build: {
                files: {
                    '../server/src/shared.gen.js': libs.concat(sources),
                    '../client/src/js/shared.gen.js': libs.concat(sources)
                }
            }
        },
        copy: {
            main: {
                files: [
                    { expand: true, src: ['assets/*.json'], dest: '../server/assets/', filter: 'isFile', flatten: true},
                    { expand: true, src: ['assets/*.json'], dest: '../client/src/assets/', filter: 'isFile', flatten: true}
                ]
            }
        },
        watch: {
            scripts: {
                files: sources.concat(libs).concat('gruntfile.js').concat('assets/*.json'),
                tasks: ['uglify', 'jshint', 'copy'],
                options: {
                    reload: true,
                    spawn: false,
                    atBegin: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', 'watch');
};