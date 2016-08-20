//////////////////////////////////////////////////////////////////
// Requires
/////////////////////////////////////////////////////////////////

var gulp = require('gulp'),
    path = require('path'),
    plumber = require('gulp-plumber'),
    browserSync = require('browser-sync').create(),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    jade = require('gulp-jade'),
    rename = require('gulp-rename'),
    runSequence = require('run-sequence'),
    filter = require('gulp-filter'),
    zip = require('gulp-zip'),
    del = require('del'),
    stylus = require('gulp-stylus'),
    webpack = require('webpack-stream'),
    inject = require('gulp-inject'),
    bowerFiles = require('main-bower-files'),
    es = require('event-stream'),
    useref = require('gulp-useref'),
    flatten = require('gulp-flatten'),
    spritesmith = require('gulp.spritesmith');

var pk = require('./package.json');
var moment = require('moment');

var time = moment().format('MMDD');

//////////////////////////////////////////////////////////////////
// Archive Tasks
/////////////////////////////////////////////////////////////////

gulp.task('archive:src', function () {
    return gulp.src('src/**/*')
        .pipe(zip(`${pk.name}_${time}_dev.zip`))
        .pipe(gulp.dest('archive/'));
});

gulp.task('archive:dist', ['build'], function () {
    return gulp.src('dist/**/*')
        .pipe(zip(`${pk.name}_${time}.zip`))
        .pipe(gulp.dest('archive/'));
});

gulp.task('archive', ['archive:src', 'archive:dist']);



//////////////////////////////////////////////////////////////////
// Building Task
/////////////////////////////////////////////////////////////////

gulp.task('build:clean', function (cb) {
    del('dist/', cb);
});

gulp.task('build:inject', ['inject'], function () {
    return gulp.src('./src/*.html')
        .pipe(useref())
        .pipe(gulp.dest('./dist'));
});

gulp.task('build:copy',function(){
    return gulp.src('./src/**/*')
        .pipe(gulp.dest('./dist'))
})

gulp.task('build:fonts',function(){
    return gulp.src('./bower_components/**/*.{otf,ttf,woff,woff2}')
        .pipe(flatten())
        .pipe(gulp.dest('./dist/fonts'))
})
gulp.task('build:remove', function (cb) {
    del(['dist/jade', 'dist/stylus'], cb);
});

gulp.task('build', function (cb) {
    runSequence(
        'build:clean',
        'build:copy',
        'build:inject',
        'build:remove',
        'build:fonts',
        cb);

});


//////////////////////////////////////////////////////////////////
// Scripts Task
/////////////////////////////////////////////////////////////////

gulp.task('js', function () {
    return gulp.src('src/js/**/*.js')
        .pipe(plumber())
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest('src/js/'))
        .pipe(browserSync.stream());
});

gulp.task('inject', function () {

    return gulp.src('./src/*.html')
        .pipe(plumber())
        .pipe(inject(gulp.src(bowerFiles(), { read: false }), { name: 'bower', relative: true }))
        .pipe(gulp.dest('./src'))
        .pipe(browserSync.stream());
})


//////////////////////////////////////////////////////////////////
// Styles Task
/////////////////////////////////////////////////////////////////


gulp.task('sprite', function () {
    var spriteData = gulp.src('./src/css/s/**/*.png')
        .pipe(plumber())
        .pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: 'sprite.css',
            algorithm: 'diagonal'
        }));
    return spriteData.pipe(gulp.dest('./src/css'))
        .pipe(browserSync.stream());;
});

gulp.task('style', function () {
    return gulp.src('src/stylus/style.styl')
        .pipe(plumber())
        .pipe(stylus())
        .pipe(autoprefixer())
        .pipe(gulp.dest('src/css'))
        .pipe(browserSync.stream());
});


//////////////////////////////////////////////////////////////////
// HTML Task
/////////////////////////////////////////////////////////////////

gulp.task("jade", function () {
    return gulp.src(["src/jade/**/*.jade", '!src/jade/layout.jade'])
        .pipe(plumber())
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('src'))
        .pipe(browserSync.stream());
});



//////////////////////////////////////////////////////////////////
// Browser-sync Task
/////////////////////////////////////////////////////////////////

gulp.task("serve", function () {

    browserSync.init({
        server: {
            baseDir: "src/",
            routes: { '/bower_components': 'bower_components' }
        }
    });

    gulp.watch('src/js/**/*.js', ['js']);
    gulp.watch('src/stylus/**/*.styl', ['style']);
    gulp.watch('src/jade/**/*.jade', ['html']);
    gulp.watch("src/*.html").on('change', browserSync.reload);
});



//////////////////////////////////////////////////////////////////
// Default Task
/////////////////////////////////////////////////////////////////

gulp.task('default', ['serve']);
