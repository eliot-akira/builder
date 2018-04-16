
const path = require('path')
const glob = require('glob')
const tester = require('./index')
const colors = require('./colors')

const cwd = process.cwd()
const options = {}
const args = process.argv.slice(2)
  .filter(k => k[0]!=='-' ? true
    : ((options[k] = true) && false)
  )

const test = tester()
const testDir = args[0] || '**'

// Shortcut for tests
global.test = test

let files

const getFiles = () => {
  files = glob.sync(`{${testDir}/**/*.test.js,${testDir}/**/tests/**/*.js}`, {
    ignore: ['**/node_modules/**', '**/.git/**', '**/_*/**', '**/_*']
  })
}
const onError = e => console.error(e)

const done = () => {

  if (options['-q']) return

  console.log(`${colors.gray}Press enter to run again, "r" to reload test paths, "q" to quit${colors.reset}`)

  process.stdin.once('data', function (b) {
    const data = b.toString().trim()
    if (data==='q') {
      process.exit()
      return
    }
    if (data==='r') getFiles()
    runTests().catch(onError)
  })
}

const clearRequireCache = () => {
  Object.keys(require.cache).forEach(key => {
    delete require.cache[key]
  })
}

let firstTime = true

async function runTests() {

  if (firstTime) firstTime = false
  else clearRequireCache()

  for (const file of files) {
    test.setCurrent({ group: file })

    const filePath = path.join(cwd, file)
    const result = require(filePath)

    // Test can export an async function
    if (result instanceof Function) {
      await result(test)
    }
  }
  await test.all()
  done()
}

getFiles()
runTests().catch(onError)