const chalk = require('chalk')

module.exports = function createLogger(options) {

  let log = (name, ...args) => {
    options.verbose && console.log(
      `  ${chalk.blue(name)}`, ...args
    )
  }

  log.title = (name, ...args) => {
    options.verbose && console.log(
      chalk.green(name)+(args.length ? ':' : ''), ...args
    )
  }

  log.info = (...args) => {
    options.verbose && console.log(...args)
  }

  log.error = (name, ...args) => {
    console.error(`  ${chalk.red(name)}`, ...args)
  }

  return log
}
