const path = require('path')
const http = require('http')
const nodeStatic = require('node-static')

module.exports = function({ src, port = 3000, dev = false, log, relative, chalk }) {

  // Reference: https://github.com/cloudhead/node-static

  const staticServer = new nodeStatic.Server(src, {
    cache: !dev,
    headers: dev ? {
      'Cache-Control': 'no-cache,must-revalidate,max-age=0'
    } : {}
  })

  http.createServer((req, res) => {
    req.addListener('end', () => {
      staticServer.serve(req, res, (e) => {
        if (e && (e.status === 404)) {
          staticServer.serveFile('index.html', 200, {}, req, res)
        }
      })
    }).resume()
  }).listen(port)

  log('static', `Serving at ${chalk.green('http://localhost:'+port)} from ${relative(src)}`)
}
