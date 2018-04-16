const chalk = require('chalk')
const { spawnSync } = require('child_process')
const getBundles = require('../utils/getBundles')
const getPackageJSON = require('../utils/getPackageJSON')

module.exports = function install(config) {

  const { root, log, relative, yesno, question, uninstall = false } = config
  const { options } = config

  options.sub = typeof options.sub!=='undefined' ? options.sub : true
  /*options.all = typeof options.all!=='undefined'
    ? options.all : !options.dev*/

  const bundles = getBundles({
    ...config,
    options
  })
  const rootPackage = getPackageJSON(root)
  let { dependencies = {}, devDependencies = {} } = rootPackage
  const installChoices = []

  if (!options.sub) {
    dependencies = {}
    devDependencies = {}
  }

  log.title(uninstall ? 'Uninstall' : 'Install')

  bundles.forEach(b => {

    // Ignore root bundle
    if (options.sub && !relative(b.root)) return

    const bundle = b.json
    const modules = []
    const devModules = []

    // ------------ Dependencies ------------
    if (!options.dev) {
      let deps = bundle.dependencies || {}
      if (!uninstall && bundle.peerDependencies) {
        deps = { ...deps, ...bundle.peerDependencies }
      }
      Object.keys(deps).forEach(dep => {

        if ((uninstall && !dependencies[dep])
          || (!uninstall && dependencies[dep])
        ) return

        modules.push(dep)
      })
    }

    // ------------ Dev dependencies ------------
    if (options.all || options.dev) {
      Object.keys(bundle.devDependencies || {}).forEach(dep => {

        if ((uninstall && !devDependencies[dep])
          || (!uninstall && devDependencies[dep])
        ) return

        devModules.push(dep)
      })
    }

    if (!modules.length && !devModules.length) return

    installChoices.push( {
      title: chalk.green(relative(b.root))+(
        b.json.description ? ` - ${b.json.description}` : ''
      ),
      modules, devModules
    })
  })

  if (!installChoices.length) {
    return log.info(uninstall ? 'Nothing to uninstall' : 'Everything is installed')
  }

  log('')

  // ------------ List choices ------------

  installChoices.forEach(({ title, modules, devModules }, index) => {

    log.info(`[${ chalk.green(index+1) }] ${title}`)

    modules.forEach(module => log(`  ${module}`))

    if (devModules.length) {
      log.info('    dev:')
      devModules.forEach(module => log(`  ${module}`))
    }
  })

  log.info(`\n[${ chalk.green("a") }] All, [${ chalk.green("Enter") }] Cancel, [${ chalk.green("1,2,3") }] Multiple\n`)

  const answer = question(`Select modules to ${uninstall ? 'uninstall' : 'install'}: `)
    .split(',').map(ans => (ans!=='' && !isNaN(ans)) ? parseInt(ans) : ans)

  let allModules = [], allDevModules = []

  // ------------ Gather modules based on answer ------------

  answer.forEach(ans => {

    if (ans==='') return

    let pushModules = [], pushDevModules = []

    // All
    if (ans==='a') {
      installChoices.forEach(({ modules, devModules }) => {
        pushModules.push(...modules)
        pushDevModules.push(...devModules)
      })
    // Selected
    } else if (installChoices[ans - 1]) {
      const { modules, devModules } = installChoices[ans - 1]
      pushModules.push(...modules)
      pushDevModules.push(...devModules)
    }

    pushModules.forEach(m => {
      if (allModules.indexOf(m)>=0) return
      allModules.push(m)
    })
    pushDevModules.forEach(m => {
      if (allDevModules.indexOf(m)>=0) return
      allDevModules.push(m)
    })
  })

  // ------------ Install ------------

  if (allModules.length) {
    const args = [
      uninstall ? 'uninstall' : 'install',
      '--save',
      ...allModules
    ]
    log.info('\nnpm '+args.join(' '))
    spawnSync('npm', args, { stdio: 'inherit' })
  }

  if (allDevModules.length) {
    const args = [
      uninstall ? 'uninstall' : 'install',
      '--save-dev',
      ...allDevModules
    ]
    log.info('\nnpm '+args.join(' '))
    spawnSync('npm', args, { stdio: 'inherit' })
  }
}
