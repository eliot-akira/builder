const path = require('path')
const gulp = require('gulp')

module.exports = function copyTask({
  src, dest, root, dev,
  log, relative, chalk,
  globalIgnore = []
}) {

  return new Promise((resolve, reject) => {
    gulp.src([src].concat(globalIgnore))
      .on('error', function(e) {
        log.error('copy', e.message)
        this.emit('end')
        reject()
      })
      .pipe(gulp.dest(dest))
      .on('end', () => {
        log('copy', `${relative(src)} -> ${chalk.green(relative(dest))}`)
        resolve()
      })
  })
}