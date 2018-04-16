const getAllBobs = require('../utils/getAllBobs')
const browserify = require('../tasks/browserify')
const sass = require('../tasks/sass')
const babel = require('../tasks/babel')

const definedTasks = [
  'babel',
  'browserify',
  'html',
  'nodemon',
  'sass',
  'copy',
  'static',
  'reload'
]
const noBuild = ['nodemon', 'static']

let tasks = {}

module.exports = function build(config) {

  const { dev, log, relative, chalk, globalIgnore } = config

  process.env.NODE_ENV = dev ? 'development' : 'production'

  const allBobs = getAllBobs(config)

  log.title('Build') //, allBobs

  let allTasks = []

  Object.keys(allBobs).forEach(key => {

    if (definedTasks.indexOf(key) < 0) {
      log.error(`Unknown task "${key}"`, allBobs[key])
      return process.exit(1)
    }

    if (noBuild.indexOf(key) >= 0) return

    if (!tasks[key]) tasks[key] = require(`../tasks/${key}`)

    allBobs[key].forEach(bundle => {
      if (key!=='reload') allTasks.push(
        tasks[key]({
          ...bundle,
          dev,
          log, relative, chalk,
          globalIgnore
        })
      )
    })
  })

  return Promise.all(allTasks)
    .then(() => ({ bob: allBobs, tasks }))
    //.catch(e => log.error(e))
}
