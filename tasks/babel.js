const path = require('path')
const gulp = require('gulp')
const babel = require('gulp-babel')
const sourcemaps = require('gulp-sourcemaps')
const $if = require('gulp-if')
const createBabelConfig = require('../babel/config')

module.exports = function babelTask(config) {

  const { src, dest, root, dev, log, relative, chalk, globalIgnore = [] } = config

  return new Promise((resolve, reject) => {
    gulp.src([`${src}/**/*.js`].concat(globalIgnore))
      .pipe($if(dev, sourcemaps.init()))
      .on('error', function(e) {
        log.error('babel', e.message)
        this.emit('end')
        reject()
      })
      .pipe(babel(createBabelConfig({ ...config, isServer: true })))
      .pipe($if(dev, sourcemaps.write()))
      .pipe(gulp.dest(dest))
      .on('end', () => {
        log('babel', `${relative(src)} -> ${chalk.green(relative(dest))}`)
        resolve()
      })
  })
}