const fs = require('fs-extra')
const chalk = require('chalk')
const getAllBobs = require('../utils/getAllBobs')
const splitDir = require('../utils/splitDir')

module.exports = function clean(config) {

  const { log, relative, yesno } = config

  const bob = getAllBobs(config)

  let folders = []

  log.title('Clean')

  Object.keys(bob).forEach(key => {

    bob[key].forEach(bundle => {

      if (!bundle.dest) return

      const folder = splitDir(bundle.dest).dir

      if (folders.indexOf(folder) >= 0) return

      folders.push(folder)
      log(folder)
    })
  })

  if (!yesno(chalk.red('Remove all folders?'))) return

  const tasks = folders.map(f => emptyDirectory(f))

  return Promise.all(tasks).then(() => log.title('Done'))
}

function emptyDirectory(dir) {
  return new Promise((resolve, reject) => {
    fs.emptyDir(dir, err => {
      if (err) reject(err)
      else resolve()
    })
  })
}