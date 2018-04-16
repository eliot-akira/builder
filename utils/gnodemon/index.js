const nodemon = require('nodemon')
const cli = require('nodemon/lib/cli')
const expandGlobs = require('./expandGlobs')

function gnodemon(settings = {}) {
  return start(parse(settings))
}

function parse(settings) {

  // Parse command-line arguments
  // Taken from start of nodemon/index.js
  if (typeof settings === 'string') {
    settings = settings.trim()
    if (settings.indexOf('node') !== 0) {
      if (settings.indexOf('nodemon') !== 0) {
        settings = 'nodemon ' + settings
      }
      settings = 'node ' + settings
    }
    settings = cli.parse(settings)
  }

  // Expand all watch globs
  if (settings.watch) {
    settings.watch = expandGlobs(settings.watch)
  }

  return settings
}

function start(settings) {

  // Pass environment variables
  settings.env = settings.env || Object.assign({}, process.env)

  // Kill nodemon process on Ctrl/Cmd + C
  process.once('SIGINT', () => process.exit())

  // Start nodemon and stream log
  return nodemon(settings)
    .on('log', ({ type, message, colour }) => {
      if (type==='error') console.error(colour)
      else console.log(colour || '')
    })
}

module.exports = gnodemon
module.exports.parse = parse
module.exports.start = start