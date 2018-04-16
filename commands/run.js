const path = require('path')
const createBabelConfig = require('../babel/config')

module.exports = function run(config) {

  const { log } = config

  const babelConfig = createBabelConfig({ ...config, isServer: true })

  require('babel-polyfill')
  require('babel-register')(babelConfig)

  const filePath = config.src || config.args[0]

  if (!filePath) {
    log.error('Command "run" requires a source file path')
    return
  }

  const fn = require(path.join(config.root, path.relative(config.root, filePath)))

  if (fn instanceof Function) fn(config)
}