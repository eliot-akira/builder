let through = require('through2')
let path = require('path')
let EJT = require('./ejt')
//let marked = require('marked')

module.exports = function (arg) {

  arg = arg || {}

  let options = arg || {}
  let data = arg.data || {}

  options.ext = options.ext || '.html'
  options.include = {
    //'.md': marked
  }

  let ejt = new EJT(options)

  return through.obj(function(file, enc, callback) {

    const onError = e => {
      callback(e)
      //this.emit('error', e)
    }

    ejt.render(replaceExtension(file.path, ''), data, function(err, html) {
      if (err) return onError(err)
      file.contents = new Buffer(html)
      file.path = replaceExtension(file.path, '.html')
      callback(null, file)
    })

  })
}

function replaceExtension(npath, ext) {
  if (typeof npath !== 'string') return npath
  if (npath.length === 0) return npath

  let nFileName = path.basename(npath, path.extname(npath))+ext
  return path.join(path.dirname(npath), nFileName)
}
