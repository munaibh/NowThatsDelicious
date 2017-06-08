// Import Dependencies
import gulp from 'gulp'
import sass from 'gulp-sass'
import source from 'vinyl-source-stream'
import uglify from 'gulp-uglify'
import buffer from 'vinyl-buffer'
import babelify from 'babelify'
import browserify from 'browserify'
import babel from 'gulp-babel'

// Development Compilation
gulp.task('js', () => {
  return browserify({entries: './src/public/javascripts/delicious-app.js', debug: true})
    .transform(babelify)
    .bundle()
    .pipe(source('script.min.js'))
    .pipe(buffer())
    // .pipe(uglify())
    .pipe(gulp.dest('./src/public/javascripts/'))
})

gulp.task('sass', () => {
  const config = {outputStyle: 'compressed' }
  return gulp.src('src/public/css/**/*.scss')
    .pipe(sass(config).on('error', sass.logError))
    .pipe(gulp.dest('./src/public/css/'))
})

gulp.task('watch', () => {
  gulp.watch('src/public/css/**/*.scss', ['sass'])
  gulp.watch(['src/public/javascripts/**/*.js', "!src/public/javascripts/script.min.js"], ['js'])
})


// Production Copy
gulp.task('babel', () => {
  return gulp.src('src/**/*.js')
    .pipe(babel({ presets: ['es2015', 'stage-2'] }))
    .pipe(gulp.dest('dist'));
});

gulp.task('copy', () => {
  gulp.src(['src/public/css/style.css','src/public/images/**/*', 'src/public/fonts/**/*', 'src/public/uploads/**/*', 'src/views/**/*'], { "base" : "./src" })
    .pipe(gulp.dest('dist'));
})

gulp.task('default', ['js', 'sass', 'watch'])
gulp.task('assets',   ['js', 'sass', 'copy'])
