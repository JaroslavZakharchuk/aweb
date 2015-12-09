var gulp        = require('gulp'),
    del         = require('del'),
    runSequence = require('run-sequence'),
    jade        = require('gulp-jade'),
    connect     = require('gulp-connect'),
    postcss     = require('gulp-postcss'),
    csso        = require('gulp-csso'),
    htmlmin     = require('gulp-htmlmin'),
    gs          = require('gulp-selectors'),
    pako        = require('gulp-pako'),
    imagemin    = require('gulp-imagemin'),
    pngquant    = require('imagemin-pngquant');

gulp.task('templates', function() {
  gulp.src('source/templates/**/*.jade')
    .pipe(jade())
    .pipe(gulp.dest('build/'))
    .pipe(connect.reload());
});

gulp.task('templates:build', function() {
  gulp.src('source/templates/**/*.jade')
    .pipe(jade())
    .pipe(gulp.dest('tmp/'))
});

gulp.task('templates:min', function() {
  gulp.src('tmp/build/*.html')
    .pipe(htmlmin({
      removeComments: true,
      removeCommentsFromCDATA: true,
      removeCDATASectionsFromCDATA: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeOptionalTags: true,
      removeIgnored: true,
      caseSensitive: true,
      minifyJS: true,
      minifyCSS: true
    }))
    .pipe(pako.gzip())
    .pipe(gulp.dest('build/'))
});

gulp.task('styles', function() {
  gulp.src('source/styles/*.css')
    .pipe(postcss([
      require('postcss-import'),
      require('postcss-nested'),
      require('postcss-advanced-variables'),
      require('postcss-focus'),
      require('css-mqpacker'),
      require('postcss-image-inliner'),
      require('autoprefixer')({browsers: ['last 1 version']})
    ]))
    .pipe(gulp.dest('build/css'))
    .pipe(connect.reload());
});

gulp.task('styles:build', function() {
  gulp.src('source/styles/*.css')
    .pipe(postcss([
      require('postcss-import'),
      require('postcss-nested'),
      require('postcss-advanced-variables'),
      require('postcss-focus'),
      require('css-mqpacker'),
      require('postcss-image-inliner'),
      require('autoprefixer')({browsers: ['last 1 version']})
    ]))
    .pipe(csso())
    .pipe(gulp.dest('tmp/'))
});

gulp.task('styles:min', function() {
  gulp.src('tmp/build/**/*.css')
    .pipe(csso())
    .pipe(pako.gzip())
    .pipe(gulp.dest('build/css/'))
});

gulp.task('styles:format', function() {
  gulp.src('source/styles/**/*.css')
    .pipe(postcss([
      require('perfectionist')({
        indentSize: 2
      }),
      require('css-mqpacker')
    ]))
    .pipe(gulp.dest('source/styles/'));
});

gulp.task('selectors', function() {
  gulp.src(['tmp/*.html','tmp/*.css'])
    .pipe(gs.run())
    .pipe(gulp.dest('tmp/build/'));
});

gulp.task('images', function() {
  gulp.src(['source/images/**/*'])
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('build/img/'))
    .pipe(connect.reload());
});

gulp.task('clean', function() {
  del(['build/'])
});

gulp.task('build', function(callback) {
  runSequence(
    'clean',
    'templates',
    'styles',
    'images',
    callback);
});

gulp.task('build:production', function(callback) {
  runSequence(
    'clean',
    'templates:build',
    'styles:build',
    'selectors',
    'templates:min',
    'styles:min',
    'images',
    callback);
});

gulp.task('watch', function() {
  gulp.watch('source/templates/**/*.jade', ['templates']);
  gulp.watch('source/styles/**/*.css', ['styles']);
  gulp.watch('source/images/**/*', ['images']);
});

gulp.task('connect', function() {
  connect.server({
    root: 'build',
    livereload: true
  });
});

gulp.task('default', ['build', 'watch', 'connect']);