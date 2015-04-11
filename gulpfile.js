'use strict';
var gulp = require('gulp');
var exec = require('child_process').exec;
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');

var PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * The default task that is run with 'gulp'.
 */
gulp.task('default', ['bundle','vendor','less']);

/**
 * Removed compiled files.
 */
gulp.task('clean', function () {
    var clean = require('gulp-clean');
    gulp.src('./build', { read: false }).pipe(clean());
    gulp.src('./bundle.js', { read: false }).pipe(clean());
    gulp.src('./node_modules/install.stamp', { read: false }).pipe(clean());
});

/**
 * Remove compiled files and installed node modules.
 */
gulp.task('veryclean', ['clean'], function () {
    var clean = require('gulp-clean');
    return gulp.src('./node_modules', { read: false })
        .pipe(clean());
});

/**
 * Compile less to css.
 *
 * Files will be compiled from `src/css` to `build/main.css`.
 */
gulp.task('less', function () {
    var less = require('gulp-less');
    var minifyCSS = require('gulp-minify-css')

    return gulp.src('./src/less/main.less')
        .pipe(less())
        .on('error', function (err) {
            console.error('Less error: ' + err.message);
            this.emit('end');
        })
        .pipe(minifyCSS({
            keepBreaks: true,
            keepSpecialComments: 0,
        }))
        .on('error', function (err) {
            console.error('CSS minify error: ' + err.message);
            this.emit('end');
        })
        .pipe(gulp.dest('./build'));
});

var libs = [
    'react',
];

function getBundleName(base) {
    return base + '.js';
    var version = require('./package.json').version;
    var name = require('./package.json').name;
    return base + '-' + version + '.' + name + '.min.js';
}

/**
 * Generate the bundle.js file.
 *
 * The entry point for the bundle is `src/bootstrap.js`.
 * Page files are also included in the bundle.
 */
gulp.task('bundle', [], function () {
    return startBundle();
});

var watch = false;

function startBundle() {
    var browserify = require('browserify');
    var babelify = require('babelify');
    var watchify = require('watchify');
    var uglify = require('gulp-uglify');

    function rebundle() {
        var _bundle = bundle.bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source(getBundleName('client')))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))

        if (PRODUCTION) {
            _bundle = _bundle.pipe(uglify('bootstrap.js', { outSourceMap: true }))
            .on('data', function (data) {
                gutil.log('uglify update', data.path);
            })
        }
        return _bundle
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./build'))
        ;
    }

    var bundle = browserify({
        // required for watchify
        cache: {},
        packageCache: {},
        fullPaths: true,
        // other options
        entries: ['./src/bootstrap.js'],
        extensions: ['js', 'jsx'],
        insertGlobals: true,
        debug: true,
    })
    .transform(babelify)
    .external(libs);

    if (watch) {
        bundle = watchify(bundle);
        bundle.on('update', function (ids) {
            rebundle(bundle);
            gutil.log('watchify update', ids);
        });
        bundle.on('log', function (msg) {
            gutil.log('watchify ' + msg);
        });
    }
    return rebundle();
}

gulp.task('vendor', [], function () {
    var browserify = require('browserify');
    var uglify = require('gulp-uglify');

    var _vendor = browserify({
        entries: [],
        insertGlobals: true,
        debug: true,
    }).require(libs).bundle()
    .pipe(source(getBundleName('vendor')))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))

    if (PRODUCTION) {
        _vendor = _vendor.pipe(uglify())
    }
    return _vendor
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./build'))
    ;
});

/**
 * Watch all files in src for changes and run default task.
 */
gulp.task('watch', function () {
    gulp.watch(['src/less/**'], ['less']);
    watch = true;
    startBundle();
});

gulp.task('run', function () {
    var supervisor = require('gulp-supervisor');

    // Start server
    supervisor('./server/bootstrap.js', {
        harmony: true,
        args: [],
        ignore: [ './build' ]
    });
});
