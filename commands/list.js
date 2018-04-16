const getBundles = require('../utils/getBundles')

module.exports = function list(config) {

  const { log, relative } = config
  const { options } = config

  options.sub = typeof options.sub!=='undefined' ? options.sub : true

  const bundles = getBundles(config)

  log.title('Projects')

  bundles.forEach(b => log(relative(b.root) || '.'))
}