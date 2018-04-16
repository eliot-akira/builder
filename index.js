const getConfig = require('./utils/getConfig')

const config = getConfig({
  commands: [
    'dev',
    'build',
    'serve',
    'clean',
    'help',
    'test',
    'run',

    // TODO: Document
    'list',
    'install',
    'uninstall',
    'git'
  ],
  defaultCommand: 'help'
})

const { command } = config

try {
  const result = require(`./commands/${command}`)(config)
  if (result && result.catch) result.catch(e => console.error(e))
} catch (e) {
  console.error(e)
}
