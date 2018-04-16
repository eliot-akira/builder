
// https://github.com/markdown-it/markdown-it
// https://www.npmjs.com/browse/keyword/markdown-it-plugin

const markdownIt = require('markdown-it')

const markdown = markdownIt({
  html: true,
  //linkify: true,
  //typography: true,
  //breaks: true
})
//https://github.com/medfreeman/markdown-it-toc-and-anchor
/*.use(require('./tableOfContents'), {

})*/
  .use(require('./taskLists'), {
    enabled: true
  })

module.exports = c => markdown.render(c) // Preserve `this`