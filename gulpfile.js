const {watch, series, parallel, src, dest, lastRun, task } = require('gulp');
const sass = require('gulp-sass')(require("sass"));
const sassGlob = require('gulp-sass-glob-use-forward');
const imagemin = require('gulp-imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');
const browserSync = require('browser-sync').create();
const prettify = require('gulp-prettify');
const del = require('del');
// const sassGlob = require("gulp-sass-glob");

// HTML整形
const htmlFormat = (done) => {
  src('./src/**/*.html')
    .pipe(
      prettify({
        indent_char: ' ',
        indent_size: 2,
        unformatted: ['a', 'span', 'br'],
      }),
    )
    .pipe(dest('./docs/'));
    done();
}

// sassコンパイル
const compileSass = (done) => {
  src('./src/assets/styles/style.scss')
    .pipe(sassGlob())
    .pipe(
      sass({outputStyle: 'compressed'})
      .on('error', sass.logError)
    )
    .pipe(dest("./docs/assets/styles"));
    done();
}

// 画像圧縮
const imageMin = (done) => {
    src('./src/assets/images/**/*.{jpg,jpeg,png,svg,gif}')
      .pipe(
        imagemin([
          pngquant({
            quality: [.60, .70], // 画質
            speed: 1 // スピード
          }),
          mozjpeg({ quality: 65 }), // 画質
          imagemin.svgo(),
          imagemin.optipng(),
          imagemin.gifsicle({ optimizationLevel: 3 }) // 圧縮率
        ])
      )
      .pipe(dest('./docs/assets/images'));
      done();
}

// jsコピー
const copyjs = (done) => {
  src('src/assets/js/*.js')
    .pipe(dest("./docs/assets/js"));
    done();
}

// ブラウザ更新
const initBrowsersync = (done) => {
  browserSync.init({
    port: 8080,
    server: {
      baseDir: './docs',
      index: 'index.html',
    },
    reloadOnRestart: true,
    open: 'external',
  });
  done();
}

// ウォッチタスク
const watchFiles = (done) =>{
  const browserReload = () => {
    browserSync.reload();
    done();
  };

  // scssファイル変更時
  watch('./src/assets/styles/**/*.scss')
    .on('change', series(compileSass, browserReload))
  // scssファイル追加時
  watch('./src/assets/styles/**/*.scss')
    .on('add', series(compileSass, browserReload))
  // htmlファイル追加時
  watch('./src/**/*.html')
    .on('add', series(htmlFormat, browserReload));
  // htmlファイル変更時
  watch('./src/**/*.html')
    .on('change', series(htmlFormat, browserReload));
  // jsファイル追加時
  watch('./src/assets/js/**/*.js')
    .on('add', series(copyjs, browserReload));
  // jsファイル変更時
  watch('./src/assets/js/**/*.js')
    .on('change', series(copyjs, browserReload));

  // htmlファイル削除時
  watch([
    './src/**/*.html'
    ])
    .on('unlink', (event) => {
      const path = event.replace('src', 'docs');
      del(path);
    });

  // scssファイル削除時
  watch('./src/assets/styles/**/*.scss')
    .on('unlink', (event) => {
      let path = event.replace('src', 'docs');
      path = path.replace('scss', 'css');
      del(path);
    });
}

// デフォルトタスク
exports.default = series(
  parallel(compileSass, imageMin, htmlFormat, copyjs),
  series(initBrowsersync, watchFiles),
);

task('imageMin', () => {
  watch('./src/assets/images/*.{jpg,jpeg,png,svg,gif,ico}')
    .on('add', series(imageMin, browserReload));
});
