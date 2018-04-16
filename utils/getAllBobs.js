const path = require('path')
const getBundles = require('./getBundles')
const withDefaults = require('../defaults')

module.exports = function getAllBobs(config) {

  const { args, relative } = config

  const bundles = getBundles(config)
  let allBobs = {}

  bundles.forEach(bundle => {

    const root = bundle.root
    const relativeRoot = relative(root)

    // If project dirs specified
    if (args.length
      && args.indexOf(relativeRoot ? relativeRoot : '.') < 0
    ) return

    if (!bundle.json || !bundle.json.bob) return

    // Live reload default
    let {
      livereload = false,
      ...bob
    } = bundle.json.bob


    bob = withDefaults(bob)

    if (bob.reload || (typeof bob.livereload === 'undefined'
      && (bob.static || bob.nodemon) // Server
      && bob.html // HTML is needed for live reload client
    )) livereload = true

    Object.keys(bob).forEach(task => {

      const bobWithRelativePaths = []

      bob[task].forEach(b => {
        // Append relative root to these keys
        ['src', 'dest', 'watch'].forEach(key => {
          if (!b[key] || typeof b[key]!=='string') return
          b[key] = path.join(relativeRoot, b[key])
        })

        // Root path to resolve requires for browserify, babel and sass
        b.root = root
        // Each bundle can set livereload off
        b.livereload = typeof b.livereload !== 'undefined'
          ? b.livereload
          : livereload
        bobWithRelativePaths.push(b)
      })

      if (!allBobs[task]) allBobs[task] = []
      allBobs[task].push(...bobWithRelativePaths)
    })
  })

  return allBobs
}
