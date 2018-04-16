const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const { spawnSync } = require('child_process')
const fileExists = require('../utils/fileExists')

const available = ['add', 'list', 'pull']

module.exports = function list(config) {

  const { log, relative, question } = config
  let { args } = config

  const command = args[0] || 'list'

  args.shift()

  log.title('Git repos')

  const repos = getAllGitFolders(process.cwd())

  if (command==='list' || available.indexOf(command)<0) {

    // ------------ Git list ------------

    repos.forEach(b => log(relative(b) || '.'))

  } else if (command==='add') {

    // ------------ Git add ------------
    // Sort by length, to add sub repos first
    repos.sort(function(a, b){
      // ASC  -> a.length - b.length
      // DESC -> b.length - a.length
      return b.length - a.length
    })
      .forEach((repo, index) => {
        log(`git add ${relative(repo)}/`)
        spawnSync('git', ['add', `${repo}/`], { stdio: 'inherit' })
      })

  } else if (command==='pull') {

    // ------------ Git pull ------------

    let pullRepos = []

    if (!args.length) {

      log('')

      repos.forEach((b, index) => {
        log.info(`[${ chalk.green(index+1) }] ${relative(b) || '.'}`)
      })

      log.info(`[${ chalk.green("0") }] All, [${ chalk.green("Enter") }] Cancel, Multiple: 1,2,3\n`)

      let answers = question(`Select repos to pull: `)
        .split(',').map(ans => (ans!=='' && !isNaN(ans)) ? parseInt(ans) : ans)

      answers.forEach(n => {
        if (n==='') return
        if (n===0) pullRepos = repos
        if (repos[n-1]) pullRepos.push(repos[n-1])
      })

    } else {

      // Repo names given in args

      let answers = args
      let relativeRepos = repos.map(repo => relative(repo))

      answers.forEach(n => {
        if (n==='') return
        const pos = relativeRepos.indexOf(n)
        if (pos < 0 || !repos[pos]) return
        pullRepos.push(repos[pos])
      })
    }

    pullRepos.forEach(repo => {
      log(`git pull ${relative(repo)}`)
      spawnSync('git', ['pull'], { stdio: 'inherit', cwd: repo })
    })
  }
}

// ------------ Get all child folders with .git ------------

const exclude = ['.git', 'node_modules', '_unused']

function getAllGitFolders(dir) {

  let results = []

  fs.readdirSync(dir).forEach(file => {

    if (exclude.indexOf(file) >= 0 || file[0]==='_') return

    file = path.join(dir, file)

    const stat = fs.lstatSync(file)

    if (!stat || !stat.isDirectory() || stat.isSymbolicLink()) return

    const patternFile = path.join(file, '.git')

    if (fs.existsSync(patternFile)) {
      results.push(file)
    }

    results = results.concat(getAllGitFolders(file))
  })

  return results
}