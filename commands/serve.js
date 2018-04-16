const build = require('./build')
const serveStatic = require('../tasks/static')

module.exports = function serve(config) {

  const { log, relative, chalk } = config

  return build(config).then(({ bob, tasks }) => {

    log.title('Serve')

    const [staticConfig] = bob.static || []

    if (!staticConfig || !staticConfig.src) return console.log(
      `
Config needs a "static" property, for example:

"static": {
  "src": "build",
  "port": 3000
}
`)

    serveStatic({ ...staticConfig, log, relative, chalk })
  })
}