const fs = require('fs')
const path = require('path')
const fileExists = require('../utils/fileExists')

const builderRoot = path.join(__dirname, '..')

// Find node_modules folder

// Installed inside, i.e., via npm link
let moduleDir = path.join(builderRoot, 'node_modules')

if (!fileExists(path.join(moduleDir, 'babel-preset-es2015'))) {
  // Assume installed as devDependency
  moduleDir = path.join(builderRoot, '..')
}

const modulePath = (m = '') => path.join(moduleDir, m)

module.exports = function createBabelConfig(config = {}) {

  const cwd = process.cwd()
  const babelConfig = {
    presets: [
      modulePath('babel-preset-es2015'),
      modulePath('babel-preset-stage-0'),
      modulePath('babel-preset-react'),
    ],
    plugins: [
      modulePath('babel-plugin-transform-node-env-inline'),
      modulePath('babel-plugin-react-require'),
      modulePath('babel-plugin-add-module-exports'),
      //modulePath('babel-plugin-transform-runtime'),


      // Async/await support

      ...(config.isServer
        ? [] // TODO: How to ignore async/await in Node version that supports it?
        : [

        // https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-runtime

        // For standalone *client* libraries
        // TODO: Use polyfill if building whole app

          [modulePath("babel-plugin-transform-runtime"), {
            helpers: false,
            polyfill: false,
            regenerator: true,
            moduleName: modulePath('babel-runtime'),
            // useESModules: true, // if with webpack
          }],
        ]),

      path.join(__dirname, 'markdown/transform'),

      // https://github.com/tleunen/babel-plugin-module-resolver
      [modulePath('babel-plugin-module-resolver'), {
        root: [

          // Source folder root
          //path.dirname(config.src)
          './src',
          ...( Array.isArray(config.root) ? config.root : [config.root] ),

          // TODO: lib

          modulePath()
        ],
        alias: {
          ...(config.alias || {})
        },
        ...(config.resolve || {})
      }]
    ],
    //extends // <-- Get from config
    //babelrc: false // Load .babelrc manually..?
  }
  return babelConfig
}