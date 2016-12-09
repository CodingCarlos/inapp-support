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

gulp.task('default', ['render']);