var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    nodemon = require('gulp-nodemon'),
    concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    addSrc = require('gulp-add-src'),
    babel = require('gulp-babel'),
    sourcemaps = require('gulp-sourcemaps'),
    FileCache = require('gulp-file-cache');

// <editor-fold desc="client-tasks">
gulp.task('client-connect', function() {
    "use strict";
    connect.server({
        root: 'client/build/',
        port: 8080,
        livereload: true
    });
});

gulp.task('client-deploy', function() {
    "use strict";

    var scriptsButLibs = ['client/src/js/**/*.js', '!client/src/js/phaser.min.js', '!client/src/js/shared.gen.js'];

    gulp.src(scriptsButLibs)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));

    gulp.src(['shared/assets/**/*.*'])
        .pipe(gulp.dest('client/build/assets'));

    gulp.src('client/src/*.html').pipe(gulp.dest('client/build'));
    gulp.src('client/src/css/**/*.css').pipe(gulp.dest('client/build/css'));
    gulp.src('client/src/assets/**/*.*').pipe(gulp.dest('client/build/assets'));
    gulp.src(['client/src/js/phaser.min.js', 'client/src/js/shared.gen.js']).pipe(gulp.dest('client/build/js'));

    gulp.src(scriptsButLibs)
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('client/build/js'));

    gulp.src(['client/build/**/*.*'])
        .pipe(connect.reload());
});

gulp.task('client-watch', function() {
    "use strict";
    gulp.watch(['client/src/**/*.*'], ['client-deploy']);
});

// </editor-fold>

// <editor-fold desc="server-tasks">

var server = {
    watch: ['server/assets/*.*', 'server/src/**/*.js'],
    lint: ['server/src/*.js', '!server/src/shared.gen.js'],
    compile_dest: 'server/build',
    exec_name: 'main.js'
};

gulp.task('compile', function() {
    "use strict";
    gulp.src('server/src/shared.gen.js').pipe(gulp.dest('server/build'));

    return gulp.src(['server/src/**/*.js', '!server/src/shared.gen.js'])
        // .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        // .pipe(concat(server.exec_name))
        // .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(server.compile_dest));
});

gulp.task('start-server', ['compile'], function() {
    "use strict";

    return nodemon({
        script: server.compile_dest + '/' + server.exec_name,
        watch: 'server/src',
        tasks: ['compile'],
        env: { 'ASSETS_FOLDER': 'shared/assets/'}
    }).on('restart', function(changeList) {
        //console.log(changeList)
        var result = [];
        for (var item in changeList) {
            // console.log(item);
            var strItem = changeList[item];
            if (strItem.includes('gen.js')) continue;

            result.push(strItem);
        }
        gulp.src(result)
            .pipe(jshint())
            .pipe(jshint.reporter('default'));
    }).on('start', function() {
        require('fs').writeFileSync('client/src/srvreload.file', new Date());
    });
});

// </editor-fold>

// <editor-fold desc="shared-tasks">

var sharedLib = [
    'shared/src/GameParams.js',
    'shared/src/SharedUtils.js',
    'shared/src/SendMessage.js',
    'shared/src/LevelModel.js',
    'shared/src/ShitCast.js',
    'shared/src/simulation/timeline/InstantTimeline.js',
    'shared/src/simulation/timeline/StreamTimeline.js',
    'shared/src/simulation/action/**/*.js',
    'shared/src/simulation/entities/Player.js',
    'shared/src/simulation/PlayerRegistry.js',
    'shared/src/simulation/Physics.js',
    'shared/src/simulation/Simulation.js'
];

gulp.task('deploy-shared', function() {
    "use strict";

    // gulp.src(['shared/src/**/*.js', '!shared/src/matter-0.8.0.js'])
    //     .pipe(jshint())
    //     .pipe(jshint.reporter('default'));

    gulp.src(sharedLib)
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(addSrc.prepend('shared/src/matter-0.8.0.js'))
        .pipe(concat('shared.gen.js'))
        .pipe(gulp.dest('client/src/js'))
        .pipe(gulp.dest('server/src'));

    gulp.src(['shared/assets/**/*.*'])
        .pipe(gulp.dest('client/build/assets'));
});

gulp.task('watch-shared', function() {
    "use strict";
    return gulp.watch(['shared/src/**/*.*', 'shared/assets/**/*.*'], ['deploy-shared']);
});

// </editor-fold>