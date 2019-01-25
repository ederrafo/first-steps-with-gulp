
var gulp   = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

// First the task will minify and rename a JS file using gulp-uglify and gulp-rename.
gulp.task('rename', function() {
  return gulp.src('./assets/js/jquery/jquery-2.1.1.js')
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('public/js/'));
});


// gulp concat
gulp.task('concat', function(){
	return gulp.src('./assets/js/concat/*.js')
		.pipe(concat('concatenated.js'))
    	.pipe(uglify()) // this set all in one line
		.pipe(gulp.dest('./public/js/'));
});

// gulp jshint
var jshint = require('gulp-jshint');
const stylish = require('jshint-stylish');

gulp.task('lint', function(){
	return gulp.src('./assets/js/concat/*.js')
			.pipe(jshint())
			// .pipe(jshint.reporter('default'));
			.pipe(jshint.reporter(stylish))
			.pipe(jshint.reporter('fail'));
});

// Execute tasks in gulp 4
gulp.task('default', gulp.parallel('rename', 'concat', 'lint'));



/**
 * src: https://fettblog.eu/gulp-4-parallel-and-series/
 */