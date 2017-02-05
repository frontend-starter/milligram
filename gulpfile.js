var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    typographic = require('typographic'),
    nib = require('nib'),
    rupture = require('rupture'),
    del = require('del'),
    browserSync = require('browser-sync').create(),
    runSequence = require('run-sequence'),
    paths = {
    views: 'src/views/index.pug',
    styles: 'src/styles/main.styl',
    scripts: 'src/scripts/main.coffee',
    images: 'src/img/**/*',
    vendors: 'src/vendors/',
    css: './src/assets/css',
    js: './src/assets/js',
    img: './dist/img',
    dist: './dist/'
    };

// Clean
gulp.task('clean-assets', function() {
    return del('./src/assets')
});

gulp.task('clean-vendors', function() {
    return del('./src/vendors')
});

gulp.task('clean-dist', function() {
    return del('./dist')
});

gulp.task('clean-css', function() {
    return del(paths.css)
});

gulp.task('clean-js', function() {
    return del(paths.js)
});

// Main bower files
gulp.task('vendors', ['clean-vendors'], function() {
    return gulp.src('./bower.json')
        .pipe($.mainBowerFiles({
            overrides: {
                jquery: {
                    main: [
                        './dist/jquery.js',
                        './dist/jquery.min.js'
                    ]
                },
                milligram: {
                    main: [
                        './dist/milligram.css',
                        './dist/milligram.min.css'
                    ]
                }
            }
        }))
        .pipe($.bowerNormalize({bowerJson: './bower.json'}))
        .pipe(gulp.dest(paths.vendors));
});

// Html
gulp.task('views', function buildHTML() {
  return gulp.src(paths.views)
  .pipe($.plumber())
  .pipe($.pug({
    pretty: true
  }))
  .pipe(gulp.dest('./src'));
});

// Styles
gulp.task('styles', ['clean-css'], function () {
    return gulp.src(paths.styles)
        .pipe($.plumber())
        .pipe($.stylus({
            use: [typographic(), nib(), rupture()]
        }))
        .pipe($.cssbeautify({indent: '  '}))
        .pipe($.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest(paths.css))
        .pipe($.rename({suffix: '.min'}))
        .pipe($.cssnano())
        .pipe(gulp.dest(paths.css))
        .pipe(browserSync.stream())
        .pipe($.notify({ message: 'Styles task complete' }));
});

// Scripts
gulp.task('scripts', ['clean-js'], function() {
  return gulp.src(paths.scripts)
    .pipe($.plumber())
    .pipe($.coffee())
    .pipe(gulp.dest(paths.js))
    .pipe($.rename({ suffix: '.min' }))
    .pipe($.uglify())
    .pipe(gulp.dest(paths.js))
    .pipe(browserSync.stream())
    .pipe($.notify({ message: 'Scripts task complete' }));
});

// Images
gulp.task('images', function() {
  return gulp.src(paths.images)
    .pipe($.imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest(paths.img))
    .pipe($.notify({ message: 'Images task complete' }));
});

// Serve
gulp.task('serve', ['vendors', 'views', 'styles', 'scripts'], function() {

    browserSync.init({
        server: "./src"
    });
    gulp.watch("src/views/*.pug", ['views']);
    gulp.watch("src/styles/*.styl", ['styles']);
    gulp.watch(paths.scripts, ['scripts']);
    gulp.watch(paths.images).on('change', browserSync.reload);
    gulp.watch("src/*.html").on('change', browserSync.reload);
    gulp.watch("src/assets/css/*.css").on('change', browserSync.reload);
});

// Watch
gulp.task('watch', function() {

    // Watch .styl files
    gulp.watch('src/styles/*.styl', ['styles']);

    // Watch .js files
    gulp.watch(paths.scripts, ['scripts']);

});

// Default task
gulp.task('default', ['serve']);

gulp.task('useref', ['clean-dist'], function () {
    return gulp.src('src/index.html')
        .pipe($.useref())
        .pipe($.if('*.css', $.cssnano()))
        .pipe($.if('*.js', $.uglify()))
        .pipe(gulp.dest('dist'));
});

gulp.task('build', function(callback){
    runSequence('useref', 'images', callback)
});
