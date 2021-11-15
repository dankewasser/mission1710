var pkg = require('./package.json');
var _cacheLocation = '.css-cache';

var gulp = require('gulp'),
    _ = require('lodash'),
    concat = require('gulp-concat'),
    consolidate = require('gulp-consolidate'),
    cssmin = require('gulp-cssmin'),
    // iconfont = require('gulp-iconfont'),
    imgmin = require('gulp-imagemin'),
    pleeease = require('gulp-pleeease'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    stylus = require('gulp-stylus'),
    pug = require('gulp-pug'),
    browser = require("browser-sync"),
    watch = require('gulp-watch'),
    webpack = require('gulp-webpack'),
    pngquant = require('imagemin-pngquant');

var DEV = './',
    PUBLIC = '../';

var _browser = [
  'ie >= 11',
  'ios >= 9',
  'android >= 5'
];

// stylus
gulp.task('stylus', function() {
  gulp.src(DEV + 'stylus/**/!(_)*.styl')
  .pipe(plumber())
  .pipe(stylus({
    cacheLocation: _cacheLocation
  }))
  .pipe(pleeease({
    autoprefixer: {
      browsers: _browser
    },
    minifier: true,
    mqpacker: true
  }))
  .pipe(gulp.dest(PUBLIC + 'css'));
});

// css minify
/*
gulp.task('cssmin', ['sass'], function(){
  gulp.src(PUBLIC + 'css/common.css')
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(PUBLIC + 'assets/css/'))
});
*/

// iconfont
/*
var fontName = 'festa';
var runTimestamp = Math.round(Date.now()/1000);
gulp.task('iconfont', function(){
  gulp.src(DEV + 'fonts/*.svg')
    .pipe(gulp.dest(DEV + 'fonts/'))
    .pipe(iconfont({
      fontName: fontName,
      prependUnicode: true,
      formats: ['ttf', 'eot', 'woff', 'woff2'],
      timestamp: runTimestamp,
      startCodepoint: 0xF001,
      normalize: true,
      fontHeight: 100
    }))
      .on('glyphs', function(glyphs, options){
        var opt = {
          glyphs: glyphs.map(function(glyph, options){
            console.log(glyph.name);
            return{ name: glyph.name, codepoint: glyph.unicode[0].charCodeAt(0) }
          }),
          fontName: fontName,
          fontPath: '../fonts/'
        }
        gulp.src(DEV + 'fonts/_myfont.scss')
          .pipe(consolidate('lodash',opt))
          .pipe(rename({basename:'_font'}))
          .pipe(gulp.dest(DEV + 'scss/_parts/'))
      })
    .pipe(gulp.dest(PUBLIC + 'assets/fonts/'))
});
*/

// image size minify
gulp.task('imgmin', function() {
  gulp.src(DEV + 'images/**/*')
  .pipe(imgmin([
    pngquant({quality: 100-100, speed: 1})
  ]))
  // .pipe(imgmin({quality: '65-80', speed: 1}))
  .pipe(gulp.dest(PUBLIC + 'images'));
});

// js concat
gulp.task('concat', function() {
  gulp.src([DEV + 'js/lib/jquery-3.2.1.min.js', DEV + 'js/lib/pixi.min.js', DEV + 'js/lib/*'])
  .pipe(plumber())
  .pipe(concat('lib.js'))
  .pipe(gulp.dest(PUBLIC + 'js'));
});

// webpack
gulp.task('webpack', function() {
  gulp.src([DEV + 'js/*.js', DEV + 'js/**/*.js'], {base: 'js'})
    .pipe(plumber())
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(gulp.dest(PUBLIC + 'js'));
});

// pug
gulp.task('pug', function() {
  gulp.src([DEV + 'pug/**/*.pug', '!' + DEV +'pug/**/_*.pug'])
    .pipe(plumber())
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest(PUBLIC));
    //.pipe(browser.reload({stream:true}));
});

// browser
gulp.task('server', function() {
  browser({
    server: {
      baseDir: PUBLIC
    },
    open: 'external',
    port: 4008,
    notify: false,
    ui: false
  });
});

gulp.task('sync', function () {
  browser.reload();
});

gulp.task('default', ['webpack', 'concat', 'server'], function(){
  watch(DEV + 'js/**/*.js', function(){
    gulp.start(['webpack', 'concat']);
  });
  // watch(DEV + 'stylus/**/*.styl', function(){
  //   gulp.start(['stylus']);
  // });
  // watch(DEV + 'pug/**/*.pug', function() {
  //   gulp.start(['pug']);
  // });
});
