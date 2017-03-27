var gulp = require('gulp'),
debug = require('gulp-debug'),
clean = require('gulp-clean'),
ejs = require('gulp-ejs'),
concat = require('gulp-concat'),
sourcemaps = require('gulp-sourcemaps'),
uglify = require('gulp-uglify'),
rename = require('gulp-rename'),
runSequence = require('run-sequence'),
templateHTML = require('./template/data'),
browserSync = require('browser-sync').create();


gulp.task('clean', function() { 
    gulp.src(['./build/*', './dist/*'])
        .pipe(clean('./build'))
        .pipe(clean('./dist'));
});

gulp.task('storage', function() { 
    gulp.src('./js/storage/*.js')
        .pipe(concat('storage-all.js'))
        .pipe(gulp.dest('./build'));
});

gulp.task('render', function(){
    gulp.src(["./js/**.js", "!./js/firebase.js"])
        .pipe(debug({title: 'Render Task:'}))
        .pipe(ejs({data: templateHTML}))
        .pipe(gulp.dest("./build"));
});

gulp.task('bundle', ['storage', 'render'], function(){
    gulp.src(["./build/storage-all.js", "./build/chat.js"])
        .pipe(concat('chat.js'))
        .pipe(gulp.dest("./dist"));

    gulp.src(["./build/storage-all.js", "./build/chat.js", './build/provider.js'])
        .pipe(concat('provider.js'))
        .pipe(gulp.dest("./dist"));
});


gulp.task('build', ["storage", "render"]);

/*
gulp.task('dist-html', function(){
    gulp.src("./*.html")
        .pipe(debug({title: 'Move to Dist - HTML:'}))
        .pipe(gulp.dest("./dist"));
})

gulp.task('dist-css', function(){
    gulp.src("./css/*.css")
        .pipe(debug({title: 'Move to Dist - CSS:'}))
        .pipe(gulp.dest("./dist/css"));
})

gulp.task('dist-img', function(){
    gulp.src("./img/**.**")
        .pipe(debug({title: 'Move to Dist - IMG:'}))
        .pipe(gulp.dest("./dist/img"));
})

gulp.task('move-to-dis', ['dist-html', 'dist-css', 'dist-img'])

gulp.task('default', ['move-to-dis','render']);

gulp.task('move-to-dis', function(callback){
    runSequence(
        'dist-img',
        'dist-html',
        'dist-css',
        callback
    );
})
*/

// gulp.task('default', ["clean", "storage", "render", "bundle"]);