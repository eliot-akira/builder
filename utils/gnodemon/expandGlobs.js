const path = require('path')
const glob = require('glob')

module.exports = function expandGlobs(patterns = []) {

  let result = []

  if (!Array.isArray(patterns)) patterns = [patterns]

  patterns.forEach(pattern => {

    // Split directory and file name
    let patternDir = path.dirname(pattern)+'/'
    let patternFile = pattern.replace(patternDir, '')

    // Get all matching directories
    if (patternFile.indexOf('.') < 0) {
      pattern = pattern+'/'
      patternFile = ''
    } else {
      pattern = patternDir
    }

    const files = glob.sync(pattern)

    if (!files.length) return

    result = result.concat(files.map(file => file+patternFile))
  })

  return result
}
