'use strict';
var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var browserSync = require('browser-sync').create();
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var del = require("del");
var run = require("gulp-sequence");
var rename = require("gulp-rename");
var imagemin = require('gulp-imagemin');
var minify = require("gulp-csso");
var mqpacker = require('css-mqpacker');
var deploy = require('gulp-gh-pages');

gulp.task('style', function () {
    return gulp.src('app/scss/style.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(postcss([
            autoprefixer(),
            mqpacker({
                sort: false
            })
        ]))
        .pipe(gulp.dest('build/css'))
        .pipe(browserSync.stream())
        .pipe(minify())
        .pipe(rename("style.min.css"))
        .pipe(gulp.dest('build/css'));

});

gulp.task("html", function () {
    gulp.src("*.html")
        .pipe(gulp.dest("build/"));
});

gulp.task("html:copy", function() {
    return gulp.src('./app/*.html')
        .pipe(gulp.dest("build"))
});

gulp.task("html:update", ["html:copy"], function(done) {
    browserSync.reload();
    done();
});

gulp.task('js:copy', function() {
    return gulp.src(['app/js/*.js'], {
        base: './app'
    })
        .pipe(gulp.dest("build"));
});

gulp.task('images', function () {
    return gulp.src('build/img/**/*.{png,jpg}')
        .pipe(imagemin([
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.jpegtran({progressive: true})
        ]))
        .pipe(gulp.dest('build/img'))
});

gulp.task('copy', function () {
    return gulp.src([
        './app/fonts/**/*/*.{woff, woff2}',
        './app/img/**',
        './app/js/**',
        './app/favicons/**',
        './app/*.html'
    ], {
        base: './app'
    })
        .pipe(gulp.dest('build'));
});

gulp.task("clean", function () {
    return del("build");
});

gulp.task('build', function (fn) {
    run(
        'clean',
        'copy',
        'html',
        'style',
        'images',
        fn
    );
});

/**
 * Push build to gh-pages
 */
gulp.task('deploy', function () {
  return gulp.src("./build/**/*")
    .pipe(deploy())
});

gulp.task('serve', function () {
    browserSync.init({
        server: 'build'
    });
    gulp.watch('./app/scss/**/*.scss', ['style']);
    gulp.watch("./app/*.html", ["html:update"]);
    gulp.watch("./app/js/*.js", ["js:copy"]);
});
