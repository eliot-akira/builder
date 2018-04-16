const install = require('./install')

module.exports = function uninstall(config) {
  return install({ ...config, uninstall: true })
}