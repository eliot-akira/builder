const fs = require('fs')

module.exports = function fileExists( file ) {
  try { fs.statSync( file ) }
  catch (e) { return false }
  return true
}
