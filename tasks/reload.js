module.exports = function reload(config) {
  const { src, dev, log } = config
  // Nothing to build: just reload

  if (dev) {
    log('reload')
  }

  return Promise.resolve()
}