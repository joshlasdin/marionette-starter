'use strict';

const watchify = require('watchify');
const browserify = require('browserify');
const aliasify = require('aliasify');
const babelify = require('babelify');
const hbsfy = require('hbsfy');
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const gutil = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');
const connect = require('gulp-connect');
const pushstate = require('connect-pushstate');
const sass = require('gulp-sass');
const args = require('yargs').argv;

gulp.task('dev', ['pages', 'scripts', 'styles', 'connect', 'watch']);

gulp.task('watch', () => {
    gulp.watch(`./src/html/**/*.html`, ['pages']);
    gulp.watch(`./src/scss/**/*.scss`, ['styles']);
});

gulp.task('connect', () => {
    connect.server({
        root: './dist',
        livereload: true,
        middleware: function(connect, opt) {
            return [
                pushstate()
            ];
        },
    });
});

gulp.task('pages', () => {
    gulp.src('./src/html/**/*.html')
        .pipe(gulp.dest('./dist'))
        .pipe(connect.reload());
});

gulp.task('styles', () => {
    gulp.src(`./src/scss/app.scss`)
        .pipe(sourcemaps.init())
        .pipe(
            sass({
                includePaths: [
                    './src/scss',
                    './node_modules',
                ],
                outputStyle: args.production ? 'compressed' : 'nested'
            })
            .on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/assets/styles'))
        .pipe(connect.reload());
});

gulp.task('scripts', () => {
    let bundler = browserify({
        entries: './src/js/index.js',
        debug: true,
        extensions: ['.js', '.hbs'],
    });

    if (args.watch) { bundler = watchify(bundler); }

    bundler
        .transform(babelify, {
            presets: ['es2015', 'stage-2'],
            plugins: ['transform-runtime', 'transform-es2015-destructuring', 'transform-object-rest-spread'],
        })
        .transform(aliasify, {
            alises: {
                underscore: 'lodash',
            },
        })
        .transform(hbsfy.configure({ extensions: ['hbs'] }));

    function rebundle() {
        gutil.log('Bundle started...');
        return bundler
            .bundle()
            .on('error', (err) => gutil.log(err.message))
            .on('end', () => gutil.log('Bundle complete!'))
            .pipe(source('app.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./dist/assets/scripts'))
            .pipe(connect.reload());
    }

    if (args.watch) { bundler.on('update', () => rebundle()); }
    rebundle();
});
