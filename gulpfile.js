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
    replace = require('gulp-replace'),
    through = require('through2'),
    fs = require('fs');

// <editor-fold desc="client-tasks">
gulp.task('client-connect', function() {
    "use strict";
    connect.server({
        root: 'client/build/',
        port: 8080,
        livereload: true
    });
});

var htmlDepList = "";
var scriptList = [];
gulp.task('client-collect-deps', function() {
    "use strict"

    var isWin = /^win/.test(process.platform);

    var d = isWin ? "\\\\" : "\/";

    return gulp.src(['client/src/js/**/*.js', '!client/src/js/phaser.min.js', '!client/src/js/shared.gen.js'])
        .pipe(through.obj(function(ch, enc, cb) {
            var regex = new RegExp("^.*client" + d + "src" + d, "i");
            var t = ch.path.replace(regex, "")
            htmlDepList += '\n    <script type="text/javascript" src="' + t + '"></script>';
            scriptList.push(ch.path.replace(regex, "client" + d + "src" + d));
            cb(null, ch)
        }));
});

gulp.task('client-deploy', ['client-collect-deps'], function() {
    "use strict";

    var scriptsButLibs = [
        'client/src/js/**/*.js', 
        '!client/src/js/phaser.min.js', 
        '!client/src/js/shared.gen.js',
        '!client/src/js/matter-0.8.0.js'
        ];

    // gulp.src(scriptsButLibs)
    //     .pipe(jshint())
    //     .pipe(jshint.reporter('default'))

    gulp.src(['shared/assets/**/*.*'])
        .pipe(gulp.dest('client/build/assets'));

    gulp.src('client/src/*.html')
        .pipe(replace(/.*<!-- GENERATOR_MARK -->.*/m, htmlDepList))
        .pipe(gulp.dest('client/build'));

    gulp.src('client/src/css/**/*.css').pipe(gulp.dest('client/build/css'));
    gulp.src('client/src/assets/**/*.*').pipe(gulp.dest('client/build/assets'));
    gulp.src([
        'client/src/js/phaser.min.js', 
        'client/src/js/shared.gen.js', 
        'client/src/js/matter-0.8.0.js'])
    .pipe(gulp.dest('client/build/js'));

    gulp.src(scriptsButLibs)
        .pipe(replace(/^import.*/gm, '\n'))
        .pipe(babel({presets: ['es2015']}))
        .pipe(gulp.dest('client/build/js'));

    gulp.src(['client/build/**/*.*'])
        .pipe(connect.reload());
});

gulp.task('client-watch', function() {
    "use strict";
    gulp.watch(['client/src/**/*.*'], ['client-collect-deps', 'client-deploy']);
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
    gulp.src('lib/*.js').pipe(gulp.dest('client/src/js'));

    gulp.src(['shared/src/**/*.js'])
        .pipe(concat('shared.gen.js'))
        .pipe(replace(/^import.*/gm, '\n'))
        .pipe(gulp.dest('shared/build'));

    gulp.src(['shared/build/shared.gen.js'])
        .pipe(gulp.dest('server/src/dependencies'));

    gulp.src(['shared/build/shared.gen.js'])
        .pipe(babel({presets: ['es2015']}))
        .pipe(gulp.dest('client/src/js'));

    gulp.src(['shared/assets/**/*.*'])
        .pipe(gulp.dest('client/build/assets'));
});

gulp.task('watch-shared', function() {
    "use strict";
    return gulp.watch(['shared/src/**/*.*', 'shared/assets/**/*.*'], ['deploy-shared']);
});

// </editor-fold>