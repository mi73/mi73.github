import gulp               from 'gulp';
import ghPages            from 'gulp-gh-pages';
import util               from 'gulp-util';
import plumber            from 'gulp-plumber';
import pug                from 'gulp-pug';
import postcss            from 'gulp-postcss';
import spritesmith        from 'gulp.spritesmith';
import imagemin           from 'gulp-imagemin';
import eslint             from 'gulp-eslint';
import webpack            from 'webpack-stream';
import uglify             from 'gulp-uglify';
import stripDebug         from 'gulp-strip-debug';
import CommonsChunkPlugin from 'webpack/lib/optimize/CommonsChunkPlugin';
import browserSync        from 'browser-sync';

const buildPath = util.env.development ? 'build/Debug' : 'build/Release';

const paths = {
  gulpFile: 'gulpfile.js',
  js: 'resources/js/**/*.js',
  css: 'resources/css/**/*.css',
  pug: 'resources/pug/**/*.pug',
  imageSrc: 'resources/img/**/*',
  html: buildPath,
  jsDest: buildPath + '/js',
  cssDest: buildPath + '/css',
  imageDest: 'buildPath/img'
};

//deploy to gh pages
gulp.task('deploy', () =>
  gulp.src('./build/Release/**/*')
    .pipe(ghPages())
);

// eslint
gulp.task('lint', () =>
  gulp.src([
    paths.js,
    paths.gulpFile
  ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
);

// compile pug
gulp.task('html', () =>
  gulp.src([
    paths.pug
  ])
    .pipe(pug({
      pretty: util.env.development
    }))
    .pipe(gulp.dest(paths.html))
);

// compile postcss
gulp.task('css', () =>
  gulp.src(paths.css)
    .pipe(plumber())
    .pipe(postcss([
      require("postcss-import")(),
      require("postcss-url")(),
      require("postcss-cssnext")(),
      // add your "plugins" here
      // ...
      // and if you want to compress
      // Disable autoprefixer, because it's already included in cssnext
      // require("cssnano")({ autoprefixer: false }),
      require("postcss-browser-reporter")(),
      require("postcss-reporter")()
    ]))
    .pipe(gulp.dest(paths.cssDest))
);

// compile javascript
gulp.task('webpack', () =>
  gulp.src('./resource/js/**')
     .pipe(plumber())
     .pipe(webpack({
       entry: {
         index: './resource/js/index.js',
         vendor: [
           'jquery',
           'underscore',
           'velocity-animate',
           'util',
           'events'
         ]
       },
       output: {
         filename: '[name].bundle.js'
       },
       resolve: {
         extensions: ['', '.js']
       },
       plugins: [
         new CommonsChunkPlugin(
           'vendor',
           'vendor.bundle.js'
         )
       ],
       module: {
         loaders: [
           {
             test: /\.(glsl|frag|vert)$/,
             loader: 'raw',
             exclude: /node_modules/
           },
           {
             test: /\.(glsl|frag|vert)$/,
             loader: 'glslify',
             exclude: /node_modules/
           },
           {
             test: /\.js$/,
             exclude: /node_modules/,
             loader: 'babel',
             query: {
               presets: ['es2016']
             }
           },
           //{ test: /\.css$/, loader: "style!css" },
         ]
       },
       cache: true,
       watch: util.env.watch,
       keepalive: true
     }))
     .pipe(util.env.development ? util.noop() : stripDebug())
     .pipe(util.env.development ? util.noop() : uglify())
     .pipe(gulp.dest(jsDest))
     .pipe(browserSync.reload({stream: true}))
);

// make sprite image
gulp.task('sprite',  () => {
  let spriteData = gulp.src('./resources/sprite/*.png')
  .pipe(spritesmith({
    padding: 2,
    imgName: 'sprite.png',
    cssName: '_sprite.css',
    imgPath: '/images/common/sprite.png',
    cssFormat: 'css_retina'
  }));
  spriteData.img.pipe(gulp.dest('./resources/img/'));
  spriteData.css.pipe(gulp.dest('./resources/css/'));
});

// image compression
gulp.task('imagemin',() =>
  gulp.src(paths.imageSrc)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.imageDest))
);

// server refresh
gulp.task('serverReload', () =>
  browserSync.reload()
);

// auto reload server
gulp.task('server', () => {
  browserSync.init({
    server: buildPath
  });
  gulp.watch([buildPath + '/**/*'], ['serverReload']);
});