import gulp from 'gulp';
import ghPages from 'gulp-gh-pages';
import eslint from 'gulp-eslint';
import pug from 'gulp-pug';
import util from 'gulp-util';

const buildPath = util.env.development ? 'build/Development' : 'build/Release';
const paths = {
  js: 'resources/js',
  libDir: 'lib',
  gulpFile: 'gulpfile.js',
  pug: 'resources/pug',
  html: buildPath
};

gulp.task('deploy', () =>
  gulp.src('./build/Release/**/*')
    .pipe(ghPages())
);

gulp.task('lint', () =>
  gulp.src([
    paths.js,
    paths.gulpFile
  ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    //.pipe(flow({abort: true})),
);

gulp.task('html', () =>
  gulp.src([
    paths.pug
  ])
    .pipe(pug())
    .pipe(gulp.dest(paths.html))
);

// gulp.task('js', () =>
//
// );