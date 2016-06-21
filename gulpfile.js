var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    nodemon = require('gulp-nodemon'),
    concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    dev_server = require('gulp-develop-server');

// <editor-fold desc="client-tasks">

var client = {
    watch : ['client/src/**/*.*'],
    lint: ['client/src/js/**/*.js', '!client/src/js/**/*.gen.js', '!client/src/js/**/*.min.js'],
    root: 'client/src',
    reload: ['client/src/*.html']
};

gulp.task('client-connect', function() {
    "use strict";
    connect.server({
        root: client.root,
        port: 8080,
        livereload: true
    });
});

gulp.task('client-deploy', function() {
    "use strict";
    gulp.src(client.lint)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));

    gulp.src(client.reload)
        .pipe(connect.reload());
});

gulp.task('client-watch', function() {
    "use strict";
    gulp.watch(client.watch, ['client-deploy']);
});

// </editor-fold>

// <editor-fold desc="server-tasks">

var server = {
    watch: ['server/assets/*.*', 'server/src/**/*.js'],
    lint: ['server/src/*.js', '!server/src/shared.gen.js']
};

gulp.task('lint-server', function() {
    "use strict";
    gulp.src(server.lint)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('start-server', function() {
    "use strict";

    nodemon({
        cwd: './server/',
        script: './src/main.js',
        ext: 'js json',
        tasks: ['lint-server']
    });
});

// </editor-fold>

// <editor-fold desc="shared-tasks">

gulp.task('deploy-shared', function() {
    "use strict";

    gulp.src(['shared/src/**/*.js', '!shared/src/matter-0.8.0.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));

    gulp.src([
            'shared/src/matter-0.8.0.js',
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
        ])
        .pipe(concat("shared.gen.js"))
        .pipe(gulp.dest('client/src/js'))
        .pipe(gulp.dest('server/src'));

    gulp.src(['shared/assets/**/*.*'])
        .pipe(gulp.dest('client/src/assets'))
        .pipe(gulp.dest('server/assets'))
});

gulp.task('watch-shared', function() {
    "use strict";
    return gulp.watch(['shared/src/**/*.*', 'shared/assets/**/*.*'], ['deploy-shared']);
});

// </editor-fold>