
var gulp = require('gulp'),
    cleanCSS = require('gulp-clean-css'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify'),
    usemin = require('gulp-usemin'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    changed = require('gulp-changed'),
    rev = require('gulp-rev'),
    browserSync = require('browser-sync'),
    ngannotate = require('gulp-ng-annotate'),
    clean = require('gulp-clean'),
    del = require('del');

gulp.task('jshint', function() {
    return gulp.src('public/javascripts/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

gulp.task('usemin',['jshint'], function () {
    return gulp.src('./public/**/*.html')
        .pipe(usemin({
            css:[cleanCSS(),rev()],
            js: [ngannotate(),uglify(),rev()]
        }))
        .pipe(gulp.dest('dist/'));
});


// Images
gulp.task('imagemin', function() {
    return del(['dist/images']), gulp.src('public/images/**/*')
        .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
        .pipe(gulp.dest('dist/images'))
        .pipe(notify({ message: 'Images task complete' }));
});

// Clean
gulp.task('clean', function() {
    return gulp.src(['dist/**/*.{js,css,html,ttf,woff,eof,svg}*', '!dist'])
        .pipe(clean());
});

gulp.task('copyfonts', ['clean'], function() {
    gulp.src('./public/bower_components/font-awesome/fonts/**/*.{ttf,woff,eof,svg}*')
        .pipe(gulp.dest('./dist/fonts'));
    gulp.src('./public/bower_components/bootstrap/dist/fonts/**/*.{ttf,woff,eof,svg}*')
        .pipe(gulp.dest('./dist/fonts'));
});

// Watch
gulp.task('watch', ['browser-sync'], function() {

    // Watch servicesTemp.js files
    gulp.watch('{public/javascripts/**/*.js, public/stylesheets/**/*.css, public/**/*.html}', ['usemin']);

    // Watch image files
    gulp.watch('public/images/**/*', ['imagemin']);

});

gulp.task('browser-sync', ['default'], function () {
    var files = [
        'public/**/*.html',
        'public/stylesheets/**/*.css',
        'public/images/**/*.png',
        'public/javascripts/**/*.js',
        'dist/**/*'
    ];

    browserSync.init(files, {
        server: {
            baseDir: "dist",
            index: "index.html"
        }
    });

    // Watch any files in dist/, reload on change
    gulp.watch(['dist/**']).on('change', browserSync.reload);

});

// Default task
gulp.task('default', ['clean'], function() {
    gulp.start('usemin','copyfonts');
});