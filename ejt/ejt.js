let fs = require('fs')
let path = require('path')

let Shared = {}

const EJT = function (options) {

  if (!(this instanceof EJT)) {
    return new EJT(options)
  }

  this.options = {
    open: '<%',
    close: '%>',
    ext: '',
    cache: true,
    watch: false,
    root: '',
    srcRoot: ''
  }

  let
    ejt = this,
    trimExp = /^[ \t]+|[ \t]+$/g,
    newlineExp = /\n/g,
    cache = {},
    watchers = {},
    indentChars = { ':': ':', '>': '>' },
    escapeExp = /[&<>"]/,
    escapeAmpExp = /&/g,
    escapeLtExp = /</g,
    escapeGtExp = />/g,
    escapeQuotExp = /"/g,
    regExpEscape = function (str) {
      return String(str).replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
    },

    read = function (file) {
      const thisRoot = ejt.options.root || ejt.options.srcRoot
      const relativeFile = path.relative(thisRoot, file)
      const err = `Failed to load template "${relativeFile}"` // from ${thisRoot}

      if (typeof ejt.options.root === 'object') {

        let data = file.split('.').reduce(function (currentContext, key) {
          return currentContext[key]
        }, ejt.options.root)

        if (typeof data === 'string') {
          return data
        } else {
          throw new Error (err)
        }
      } else {
        try {


//console.log('READ', file)

          return fs.readFileSync(file, 'utf8')
        } catch (e) {
          throw new Error (err)
        }
      }
    },

    compile = function (template) {
      let
        lineNo = 1,
        bufferStack = [ 'Output' ], bufferStackPointer = 0,
        buffer = bufferStack[bufferStackPointer] + ' = \'',
        matches = template.split(new RegExp(regExpEscape(ejt.options.open) + '((?:.|[\r\n])+?)(?:' + regExpEscape(ejt.options.close) + '|$)')),
        output, text, command, line,
        prefix, postfix, newline,
        indentChar, indentation = '', indent = false, indentStack = [], indentStackPointer = -1, baseIndent, lines, j, tmp

      for (let i = 0; i < matches.length; i++) {
        text = matches[i]
        command = ''
        if (i % 2 === 1) {
          line = 'FileInfo.line = ' + lineNo
          switch (text.charAt(0)) {
          case '=':
            prefix = '\' + ((' + line + ')?\'\':\'\') + __TemplateContext.escape('
            postfix = ') + \''
            newline = ''
            text = text.substr(1)
            output = 'escaped'
            break
          case '-':
            prefix = '\' + ((' + line + ')?\'\':\'\') + (('
            postfix = ') || \'\') + \'' // ?
            newline = ''
            text = text.substr(1)
            output = 'unescaped'
            break
          default:
            prefix = '\'\n' + line
            postfix = '\n' + bufferStack[bufferStackPointer] + ' += \''
            newline = '\n'
            output = 'none'
          }
          text = text.replace(trimExp, '')

          command = text.split(/[^a-z]+/)[0]
          indentChar = indentChars[text.charAt(text.length - 1)]
          // Detect block scope
          if (indentChar || ['code', 'coded', 'block', 'if', 'else', 'for'].indexOf(command)>=0) {
            text = text.replace(/:$/, '').replace(trimExp, '')
            if (indentChar === '>') {
              if (/[$a-z_][0-9a-z_$]*[^=]+(-|=)>/i.test(text.replace(/'.*'|".*"/, ''))) {
                indentStack.push('capture_output_' + output)
                indentStackPointer++
              }
              bufferStack.push('__Function' + bufferStackPointer)
              bufferStackPointer++
              postfix = '\n' + bufferStack[bufferStackPointer] + ' = \''
              command = 'function'
            }
            indentStack.push(command)
            indentStackPointer++
            indent = true
          }
          switch (command) {
          case 'include' :
            if (output === 'none') {
              prefix = '\' + ((' + line + ')?\'\':\'\') + ('
              postfix = ') + \''
            }
            if (text.length>8 && text[7]===' ') {
              text = text.substring(8) // 'include '
              if (text[0]!=="'") text = "'"+text+"'"
              text = 'include('+text+')'
            }
            buffer += prefix.replace(newlineExp, '\n' + indentation) + text + postfix.replace(newlineExp, '\n' + indentation)
            break
          case 'block' :
            text = text.substring(6) // 'block '

            bufferStack.push('__TemplateContext.blocks[\'' + text + '\']')
             //text.replace(/block\s+('|")([^'"]+)('|").*/, '$2') + '\']');
            bufferStackPointer++
            prefix = '\'\n'
            postfix = '\n' + bufferStack[bufferStackPointer] + ' += \''

            if (text[0]!=="'") text = "'"+text+"'"
            text = 'if (block('+text+'))' // {
            buffer += prefix.replace(newlineExp, '\n' + indentation) + text
            if (indent) {
              indentation += '  '
              indent = false
            }
            buffer += postfix.replace(newlineExp, '\n' + indentation)
            break
          case 'content' :
            if (output === 'none') {
              prefix = '\' + ((' + line + ')?\'\':\'\') + ('
              postfix = ') + \''
            }
            if (text === 'content') {
              text = 'content()'
            } else {
              text = text.substring(8) // 'content '
              if (text[0]!=="'") text = "'"+text+"'"
              text = 'content('+text+')'
            }
            buffer += prefix.replace(newlineExp, '\n' + indentation) + text + postfix.replace(newlineExp, '\n' + indentation)
            break
          case 'code' :
            buffer += '<pre'+( text.substr(4) )+'><code>\'+(\''
            break
          case 'coded' :
            //buffer += '\'+([0,1].map(-> \'';
            buffer += '\'+([0,1].map(function(){return \''
            tmp = text.substr(5)
            break
          case 'end' :
            prefix = '\''
            switch (indentStack[indentStackPointer]) {
            case 'code' :
              buffer += '\'.split(/\\r\\n|\\n/).slice(0, -1).join("\\n").replace(/</g,"&lt;").replace(/>/g,"&gt;"))+\'</code></pre>'
              break
            case 'coded' :
              buffer += '\'}).map(function(x,i){ if (i===0){return x}else{return \'<pre'+tmp+'><code>\'+(x.split(/\\r\\n|\\n/).slice(0, -1).join("\\n").replace(/</g,"&lt;").replace(/>/g,"&gt;"))+\'</code></pre>\' }})).join(\'\')+\''
              break
            case 'block' :
              bufferStack.pop()
              bufferStackPointer--
              prefix = '\''
              postfix = '\n\n' + bufferStack[bufferStackPointer] + ' += \'' // '\n}\n'
              buffer += prefix.replace(newlineExp, '\n' + indentation)
              indentation = indentation.substr(2)
              buffer += postfix.replace(newlineExp, '\n' + indentation)
              break
            case 'when' :
              postfix = '\n' + bufferStack[bufferStackPointer] + ' += \'\''
              buffer += prefix.replace(newlineExp, '\n' + indentation) + postfix.replace(newlineExp, '\n' + indentation)
              indentation = indentation.substr(2)
              break
            case 'function' :
              prefix = '\'\n' + bufferStack[bufferStackPointer]
              buffer += prefix.replace(newlineExp, '\n' + indentation)
              indentation = indentation.substr(2)
              bufferStack.pop()
              bufferStackPointer--
              postfix = '\n' + bufferStack[bufferStackPointer] + ' += \''
              switch (indentStack[indentStackPointer - 1]) {
                case 'capture_output_escaped' :
                  indentStack.pop()
                  indentStackPointer--
                  buffer += ')'
                  break
                case 'capture_output_unescaped' :
                  indentStack.pop()
                  indentStackPointer--
                  buffer += ') ? \'\')'
                  break
                case 'capture_output_none' :
                  indentStack.pop()
                  indentStackPointer--
                  break
              }
              buffer += postfix.replace(newlineExp, '\n' + indentation)
              break
            case 'switch' :
              prefix = '\n' + line
            // eslint-disable no-fallthrough
            default :
              if (indentStack[indentStackPointer - 1] === 'switch') {
                postfix = ''
              }
              indentation = indentation.substr(2)
              buffer += prefix.replace(newlineExp, '\n' + indentation) + postfix.replace(newlineExp, '\n' + indentation)
            }
            indentStack.pop()
            indentStackPointer--
            break
          case 'else' :
            if (indentStack[indentStackPointer - 1] === 'switch') {
              prefix = ''
            } else {
              prefix = '\''
            }
            buffer += prefix.replace(newlineExp, '\n' + indentation)
            if (indentStack[indentStackPointer - 1] === 'if' || indentStack[indentStackPointer - 1] === 'else' || indentStack[indentStackPointer - 1] === 'unless') {
              indentStack.splice(-2, 1)
              indentStackPointer--
              indentation = indentation.substr(2)
            }
            buffer += (newline.length ? newline + indentation : '') + text
            if (indent) {
              indentation += '  '
              indent = false
            }
            buffer += postfix.replace(newlineExp, '\n' + indentation)
            break
          case 'switch' :
            buffer += prefix.replace(newlineExp, '\n' + indentation) + (newline.length ? newline + indentation : '') + text
            if (indent) {
              indentation += '  '
              indent = false
            }
            break
          case 'when' :
            buffer += (newline.length ? newline + indentation : '') + text
            if (indent) {
              indentation += '  '
              indent = false
            }
            buffer += postfix.replace(newlineExp, '\n' + indentation)
            break
          case 'extend' :
              text = text.substring(7) // 'extend ' // text.replace(/extend\s+/, '')
              if (text[0]!=="'") text = "'"+text+"'"
              text = '__Extended = true\n__Parent = ' + text
          // eslint-disable no-fallthrough
          default :
            if (/\n/.test(text)) {
              lines = text.split(/\n/)
              buffer += prefix.replace(newlineExp, '\n' + indentation)
              for (j = 0; j < lines.length; j++) {
                if (/^\s*$/.test(lines[j])) {
                  continue
                }
                if (typeof baseIndent === 'undefined') {
                  baseIndent = new RegExp('^' + lines[j].substr(0, lines[j].search(/[^\s]/)))
                }
                buffer += (newline.length ? newline + indentation : '') + lines[j].replace(baseIndent, '')
              }
              lines = undefined
              baseIndent = undefined
            } else {
              buffer += prefix.replace(newlineExp, '\n' + indentation) + (newline.length ? newline + indentation : '') + text
            }
            if (indent) {
              indentation += '  '
              indent = false
            }
            buffer += postfix.replace(newlineExp, '\n' + indentation)
            break
          }
        } else {
          if (indentStack[indentStackPointer] !== 'switch') {
            buffer += text.replace(/[\\']/g, '\\$&').replace(/\r/g, '').replace(newlineExp, '\\n').replace(/^\\n/, '')
          }
        }
        lineNo += text.split(newlineExp).length - 1
      }

      buffer += '\''

      buffer = '(function __Template(__TemplateContext, FileInfo, include, content, block) { \'use strict\'; var __Extended = false, __Parent, Output, Local = __TemplateContext.data\nLocal.file = FileInfo.file\n' + buffer + '\nif (! __Extended) {\n  return Output\n} else { \n  var __Container = __TemplateContext.load(__Parent)\n  FileInfo.file = __Container.file\n  FileInfo.line = 1\n  __TemplateContext.childContent = Output\n  return __Container.compiled.call(this, __TemplateContext, FileInfo, include, content, block)\n} })\n'

      return eval(buffer)
    }

  let TemplateContext = function (data) {
    this.blocks = {}
    this.data = data || {}
    this.childContent = ''
  }

  TemplateContext.prototype.escape = function (text) {
    if (text == null) {
      return ''
    }
    let result = text.toString()
    if (!escapeExp.test(result)) {
      return result
    }
    return result.replace(escapeAmpExp, '&#38;').replace(escapeLtExp, '&#60;').replace(escapeGtExp, '&#62;').replace(escapeQuotExp, '&#34;')
  }

  TemplateContext.prototype.block = function (name) {
    if (!this.blocks[name]) { this.blocks[name] = '' }
    return !this.blocks[name].length
  }

  TemplateContext.prototype.content = function (block) {
    if (block && block.length) {
      if (!this.blocks[block]) { return '' }
      return this.blocks[block]
    } else {
      return this.childContent
    }
  }

  TemplateContext.prototype.load = function (template) {

    let file, compiled, container, data, extension

    let extExp = new RegExp(regExpEscape(ejt.options.ext) + '$')

    if (template[0]==='/' && ejt.options.srcRoot) {
      template = path.join(ejt.options.srcRoot, template)
    }

    if (Object.prototype.toString.call(ejt.options.root) === '[object String]') {

      if (typeof process !== 'undefined' && process.platform === 'win32') {

        file = path.normalize((ejt.options.root.length && template.charAt(0) !== '/' && template.charAt(0) !== '\\' && !/^[a-zA-Z]:/.test(template) ? (ejt.options.root + '/') : '') + template.replace(extExp, ''))
      } else {
        file = path.normalize((ejt.options.root.length && template.charAt(0) !== '/' ? (ejt.options.root + '/') : '') + template.replace(extExp, ''))
      }
      if (file.indexOf('.') < 0) file += ejt.options.ext

      // Make it relative
      ejt.options.root = path.dirname( file )

    } else {
      file = template
    }

    ejt.currentFile = file

    if (ejt.options.cache && cache[file]) {
      return cache[file]
    }

    // Default file extension
    let parts = file.split('/')
    let lastPart = parts[parts.length - 1]
    parts = lastPart.split('.')
    extension = parts.length > 1 ? parts.pop() : ''
    if (!extension) {
      extension = 'html'
      file += '.html'
    }

//console.log('LOAD', { file, extension })

    data = read(file)


    extension = '.'+extension

    const relativeFile = path.relative(ejt.options.root || ejt.options.srcRoot, file)

    if ( ejt.options.include && ejt.options.include[extension] ) {
      // Middleware for file types
      compiled = function() {
        return ejt.options.include[extension](data)
      }
    } else if ( extension === '.json' ) {
      compiled = function() {
        return JSON.parse(data)
      }
    } else if (data.substr(0, 24) === '(function __Template(') {
      try {
        compiled = eval(data)
      } catch (e) {
        e.message = e.message + ' in ' + relativeFile
        throw e
      }
    } else {
      try {
        compiled = compile(data)
      } catch (e) {
        e.message = e.message.replace(/ on line \d+/, '') + ' in ' + relativeFile
        throw e
      }
    }

    container = { file: file, compiled: compiled, source: '(' + compiled.toString() + ');', lastModified: new Date().toUTCString(), gzip: null }
    if ( ejt.options.cache) {
      cache[file] = container
      if (ejt.options.watch && typeof watchers[file] === 'undefined') {
        watchers[file] = fs.watch(file, { persistent: false }, function () {
          watchers[file].close()
          delete (watchers[file])
          delete (cache[file])
        })
      }
    }
    return container
  }

  TemplateContext.prototype.render = function (template, data) {
    let that = this
    let _root = ejt.options.root

    const passData = data || this.data
    passData.Shared = Shared

    let container, fileInfo

    try {

      container = this.load(template)
      fileInfo = { file: container.file, line: 1 }

      // Call and compile template

      const result = container.compiled.call(
        passData,
        this,
        fileInfo,
        function() { return that.render.apply(that, arguments) },
        function() { return that.content.apply(that, arguments) },
        function() { return that.block.apply(that, arguments) }
      )

      // Pop current include root
      ejt.options.root = _root
      return result

    } catch (e) {

      if (!/ in /.test(e.message)) {
        e.message = e.message + (
          fileInfo ? ' in ' +
              path.relative(process.cwd(), fileInfo.file)
            + ' on line ' + fileInfo.line
          : '')
      }
      throw e
    }
  }

  this.configure = function (options) {
    options = options || {}
    for (let option in options) {
      this.options[option] = options[option]
    }
  }

  this.compile = function (template) {
    let compiled
    try {
      compiled = compile(template)
      return compiled
    } catch (e) {
      e.message = e.message.replace(/ on line \d+/, '')
      throw e
    }
  }

  this.render = function (template, data, callback) {

    let context

    ejt.options.root = path.dirname(template)
    template = path.basename(template)

    try {
      context = new TemplateContext(data)
      callback(undefined, context.render(template))
    } catch (e) {
      callback(e)
    }
/*
      context = new TemplateContext(data)
      return context.render(template)
*/
  }

  this.clearCache = function (template) {
    if (template) {
      delete (cache[template])
    } else {
      cache = {}
    }
  }

  this.compiler = function (options) {
    let zlib = require('zlib')
    options = options || {}
    options.root = options.root || '/'
    options.root = '/' + options.root.replace(/^\//, '')
    options.root = options.root.replace(/\/$/, '') + '/'
    let rootExp = new RegExp('^' + regExpEscape(options.root))
    return function (req, res, next) {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        return next()
      }
      if (!options.root || req.url.substr(0, options.root.length) === options.root) {
        let template = req.url.replace(rootExp, '')

        ejt.options.root = path.dirname(template)

        try {
          let context = new TemplateContext()
          let container = context.load(template)
          res.setHeader('Content-Type', 'application/x-javascript; charset=utf-8')
          res.setHeader('Last-Modified', container.lastModified)
          if (options.gzip) {
            res.setHeader('Content-Encoding', 'gzip')
            if (container.gzip === null) {
              zlib.gzip(container.source, function (err, buffer) {
                if (!err) {
                  container.gzip = buffer
                  res.end(container.gzip)
                } else {
                  next(err)
                }
              })
            } else {
              res.end(container.gzip)
            }
          } else {
            res.setHeader('Content-Length', typeof Buffer !== 'undefined' ? Buffer.byteLength(container.source, 'utf8') : container.source.length)
            res.end(container.source)
          }
        } catch (e) {
          next(e)
        }
      } else {
        next()
      }
    }
  }

  this.configure(options)
}

module.exports = EJT