const path = require('path')
const gulp = require('gulp')
const babel = require('gulp-babel')
const sourcemaps = require('gulp-sourcemaps')
const $if = require('gulp-if')
const createBabelConfig = require('../babel/config')
//import reloadAfterNodemon from '../utils/reloadAfterNodemon'

module.exports = function babelWatch(config) {

  const {
    src, dest, root, dev = false,
    log, relative, chalk,
    globalIgnore = []
  } = config

  // For server-side render to resolve client require
  process.env.NODE_PATH = process.env.NODE_PATH || dest

  // Watch & compile each changed file
  // Doesn't return promise because it never stops
  return gulp.watch([`${src}/**/*.js`].concat(globalIgnore))
    .on('change', (filePath) => {
      return gulp.src(filePath, { base: src })
        .pipe($if(dev, sourcemaps.init()))
        .pipe(babel(createBabelConfig(config)))
        .on('error', function(e) {
          log.error('babel', e.message)
          this.emit('end')
        })
        .pipe($if(dev, sourcemaps.write()))
        .pipe(gulp.dest(dest))
        .on('end', () => {
          log('babel', `${relative(filePath)} -> ${chalk.green(relative(dest))}`)
          // Reload client
          //reloadAfterNodemon()
        })
    })
}
