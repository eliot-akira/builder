const path = require('path')
const gulp = require('gulp')
const rename = require('gulp-rename')
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')
const minifyCSS = require('gulp-clean-css')
const autoprefixer = require('gulp-autoprefixer')
const $if = require('gulp-if')
const fileExists = require('../utils/fileExists')

module.exports = function sassTask({
  src, dest, root, dev = false,
  log, relative, chalk
}) {

  const rootSrc = path.join(root, 'src')
  const destDir = path.dirname(dest)
  const destFile = path.basename(dest)

  if (!fileExists(src)) {
    log.error('sass', `File doesn't exist: ${src}`)
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {

    gulp.src(src, {
      allowEmpty: true
    })
      .pipe($if(dev, sourcemaps.init()))
      .pipe(sass({
        keepSpecialComments: false,
        // Resolve require paths for client source
        includePaths: [
          rootSrc,
          path.join(root, 'node_modules')
        ],
        //relativeTo: root, //'./app',
        processImport: false // ?
      }))
      .on('error', function(e) {
        log.error('sass', e.message)
        this.emit('end')
        reject()
      })
      .pipe(autoprefixer({ browsers: ['last 2 versions', 'IE 10', '> 1%'], cascade: false }))
      .pipe($if(!dev, minifyCSS()))
      .pipe(rename(destFile))
      .pipe($if(dev, sourcemaps.write()))
      .pipe(gulp.dest(destDir))
      .on('end', () => {
        log('sass', `${relative(src)} -> ${chalk.green(relative(dest))}`)
        resolve()
      })
  })
}
