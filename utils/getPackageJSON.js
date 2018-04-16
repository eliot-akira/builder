const path = require('path')
const fs = require('fs')
const fileExists = require('./fileExists')

module.exports = function getPackageJSON(root) {

  const packagePath = path.join(root, 'package.json')
  const bobConfigPath = path.join(root, 'build.config.js')

  let json = {}
  try {
    if (fileExists(packagePath)) {
      try {
        json = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
      } catch (e) {
        //
      }
    }
    if (fileExists(bobConfigPath)) {

      const result = require(bobConfigPath)

      json.bob = result instanceof Function ? result()
        : result
    }
  } catch (e) {
    //
  }
  return json
}