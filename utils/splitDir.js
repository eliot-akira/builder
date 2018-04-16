const path = require('path')

module.exports = function splitDir(filePath) {

  const parts = filePath.split('/')
  let dir = parts.slice(0, -1) //.join('/')
  let file = parts[parts.length-1]

  // File name must contain dot and not start with one
  if (file.indexOf('.') > 0) {
    // Inlude wildcards, for example: **/*.js
    while (dir.length && dir[dir.length-1].indexOf('*') >= 0) {
      if (!dir.pop) { console.log('Bad path', dir); break }
      file = `${dir.pop()}/${file}`
    }
    return { dir: dir.join('/'), file }
  }

  // Only dir name is set
  return { dir: filePath, file: '' }
}