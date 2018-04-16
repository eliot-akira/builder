const getAllBobs = require('../utils/getAllBobs')

module.exports = function help(config) {

  const { log, relative } = config

  const moduleName = 'mnb'

  log.title('Use', `${moduleName} [command]`)

  log.title('Commands')

  log(`${moduleName} dev`, '  Build project for development and watch files for changes')
  log(`${moduleName} build`, 'Build project for production')
  log(`${moduleName} serve`, 'Build project and serve static files')
  log(`${moduleName} clean`, 'Remove built files')

  log.title('Current project')

  const allBobs = getAllBobs(config)

  Object.keys(allBobs).forEach(task => {

    log(task)

    const bundles = allBobs[task].reduce((obj, b) => {
      Object.keys(b).forEach(key => {
        if (!obj[key]) obj[key] = []
        obj[key].push(b[key])
      })
      return obj
    }, {})

    Object.keys(bundles).forEach(key => {

      let value = bundles[key]

      if (!Array.isArray()) value = [value]

      log.info(`    ${key}: ${value.join(', ')}`)
    })
  })
}