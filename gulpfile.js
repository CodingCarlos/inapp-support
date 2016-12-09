var gulp = require('gulp'),
debug = require('gulp-debug'),
clean = require('gulp-clean'),
ejs = require('gulp-ejs'),
templateHTML = require('./template/data'),
browserSync = require('browser-sync').create();
 
 
gulp.task('render', function(){
    gulp.src("./js/*.js")
        .pipe(debug({title: 'Render Task:'}))
        .pipe(ejs({data: templateHTML}))
        .pipe(gulp.dest("./dist/js"));
})

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