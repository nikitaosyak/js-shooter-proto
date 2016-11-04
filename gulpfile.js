var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    nodemon = require('gulp-nodemon'),
    concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    addSrc = require('gulp-add-src'),
    babel = require('gulp-babel'),
    browserify = require('browserify'),
    babelify = require('babelify'),
    source = require('vinyl-source-stream'),
    replace = require('gulp-replace');

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
    compile_dest: 'server/build',
    exec_name: 'main.js'
};

gulp.task('compile-server', function() {
    "use strict";
    // gulp.src('server/src/shared.gen.js').pipe(gulp.dest('server/build'));
    gulp.src('server/dependencies/*.js').pipe(gulp.dest('server/build/dependencies'));

    return gulp.src(['server/src/**/*.js', '!server/src/dependenciess'])
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(server.compile_dest));
});

gulp.task('start-server', ['compile-server'], function() {
    "use strict";

    return nodemon({
        script: server.compile_dest + '/' + server.exec_name,
        watch: 'server/src/**/*.js',
        tasks: ['compile-server'],
        env: { 'ASSETS_FOLDER': 'shared/assets/'}
    }).on('start', function() {
        require('fs').writeFileSync('client/src/srvreload.file', new Date());
    })
});

// </editor-fold>

// <editor-fold desc="shared-tasks">

gulp.task('deploy-shared', function() {
    "use strict";

    gulp.src('lib/*.js').pipe(gulp.dest('server/src/dependencies'));

    gulp.src(['shared/src/**/*.js'])
        .pipe(concat('shared.gen.js'))
        .pipe(replace(/^import.*/gm, '\n'))
        .pipe(gulp.dest('shared/build'));

    gulp.src(['shared/build/shared.gen.js'])
        .pipe(gulp.dest('server/src/dependencies'));

    gulp.src(['shared/build/shared.gen.js'])
        .pipe(babel({presets: ['es2015']}))
        .pipe(gulp.dest('client/build/js'));

    gulp.src(['shared/assets/**/*.*'])
        .pipe(gulp.dest('client/build/assets'));
});

gulp.task('watch-shared', function() {
    "use strict";
    return gulp.watch(['shared/src/**/*.*', 'shared/assets/**/*.*'], ['deploy-shared']);
});

// </editor-fold>