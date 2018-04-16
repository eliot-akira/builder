const path = require('path')
const run = require('./run')

module.exports = function test(config) {
  run({ ...config,
    src: path.resolve(__dirname, '..', 'tester', 'cli')
  })
}