const path = require('path')
const gulp = require('gulp')
const browserify = require('gulp-bro')
const rename = require('gulp-rename')
const babelify = require('babelify')
const uglify = require('gulp-uglify')
const $if = require('gulp-if')
const createBabelConfig = require('../babel/config')
const fileExists = require('../utils/fileExists')

module.exports = function browserifyTask(config) {

  const {
    src, dest, root, dev = false,
    log, relative, chalk
  } = config

  const srcDir = path.dirname(src)
  const destDir = path.dirname(dest)
  const destFile = path.basename(dest)

  if (!fileExists(src)) {
    log.error('browserify', `File doesn't exist: ${src}`)
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {

    return gulp.src(src, {
      read: false, // recommended option for gulp-bro
      allowEmpty: true
    })
      .pipe(browserify({
        //basedir: 'build',
        debug: dev, // Source maps
        transform: [
          [babelify.configure(createBabelConfig(config)), {

            // Transform files in node_modules
            // Necessary to alias react to preact-compat
            // https://github.com/babel/babelify#why-arent-files-in-node_modules-being-transformed
            global: true,
            //ignore: /\/node_modules\/(?!app\/)/
          }]
        ],
        // Resolve require paths for client source
        // For server-side babel, define NODE_PATH
        paths: [
          path.resolve(srcDir)
        ]
      }))
      .pipe($if(!dev, uglify()))
      .pipe(rename(destFile))
      .pipe(gulp.dest(destDir))
      .on('error', function(e) {
        log.error('browserify', e)
        this.emit('end')
        reject()
      })
      .on('end', () => {
        log('browserify', `${relative(src)} -> ${chalk.green(relative(dest))}`)
        resolve()
      })
  })
}
