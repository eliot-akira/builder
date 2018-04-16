const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const replace = require('gulp-replace')
//import ejs from 'gulp-ejs'
const ejt = require('../ejt/gulp')
//const hmml = require('../hmml/gulp')

const fileExists = require('../utils/fileExists')

module.exports = function htmlTask(config) {

  const {
    src, dest,
    dev,
    livereload = false,
    electron = false,
    log, relative, chalk,
    globalIgnore = []
  } = config

  /*if (!fileExists(src)) {
    log.error('html', `File doesn't exist: ${src}`)
    return Promise.resolve()
  }*/

  const srcParts = src.split('/')
  let srcRoot = ''
  for (let part of srcParts) {
    if (part[0]==='*' || part.indexOf('.')>=0) break
    srcRoot += part+'/'
  }
  // Pass source root for HTML template includes
  srcRoot = path.join(process.cwd(), srcRoot)

  const script = createScript({ dev, livereload, electron })

  return new Promise(function(resolve, reject) {
    gulp.src([`${src}`].concat(globalIgnore), {
      allowEmpty: true
    })

      .pipe(ejt({ ext: '.html', srcRoot }))
      //.pipe(hmml({ srcRoot, data: { key: 'value' } }))

      .on('error', function(e) {
        log.error('html', e)
        this.emit('end')
        resolve()
        //reject()
      })
      .on('end', () => {
        log('html', `${relative(src)} -> ${chalk.green(relative(dest))}`)
        resolve()
      })

      // Add live reload script to document
      .pipe(replace('</body>', `${script}</body>`))

      .pipe(gulp.dest(dest))
  })
}

let liveReloadClient

function createScript({ dev, livereload, electron }) {

  let script = ''

  if (dev && livereload) {

    if (!liveReloadClient) liveReloadClient = fs.readFileSync(
      path.join(__dirname, '../live-reload/client.js'), 'utf-8'
    )

    // TODO: Replace port number to make it unique?
    // Dev server needs the same port - See commands/dev

    script = `<script>${liveReloadClient}</script>`

  } else if (electron) {

    script =
      `<script>electron = require('electron');${
        // TODO: Load the script directly from file
        dev ? `require(process.cwd()+'/electron-connect').client.create()` : ''
      }</script>`
  }

  return script
}