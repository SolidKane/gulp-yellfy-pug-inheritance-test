const gulp = require('gulp');
const gulpif = require('gulp-if');
const filter = require('gulp-filter');
const pugInheritance = require('yellfy-pug-inheritance');
const pug = require('gulp-pug');
const less = require('gulp-less');
const browserSync = require('browser-sync');
const rename = require('gulp-rename');

let pugInheritanceCache = {};

gulp.task('watch', () => {
  global.watch = true;

  gulp.watch(['tpl/**/*.pug'], gulp.series('templates'))
    .on('all', (event, filepath) => {
      global.changedTempalteFile = filepath.replace(/\\/g, '/');
    });
});

function pugFilter(file, inheritance) {
  const filepath = `tpl/${file.relative}`; 
  console.log(file.relative);
  const depend = inheritance.getDependencies(filepath);
  console.log(depend);
  if (inheritance.checkDependency(filepath, global.changedTempalteFile)) {
    console.log(`Compiling: ${filepath}`);
    return true;
  }
  return false;
}

gulp.task('templates', () => {
  return new Promise((resolve, reject) => {
    const changedFile = global.changedTempalteFile;
    const options = {
      changedFile,
      treeCache: pugInheritanceCache
    };

    pugInheritance.updateTree('tpl/', options).then((inheritance) => {
      // Save cache for secondary compilations
      pugInheritanceCache = inheritance.tree;

      return gulp.src('tpl/*.pug')
        .pipe(gulpif(global.watch, filter((file) => pugFilter(file, inheritance))))
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest('../../'))
        .on('end', resolve)
        .on('error', reject)
        // .pipe(browserSync.reload({stream: true}))
    });
  });
});