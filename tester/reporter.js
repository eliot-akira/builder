const { red, green, blue, gray, reset } = require('./colors')

let prevGroup

const reporter = (e) => {

  const { type, state, title, id, ok, tests, passes, fails, logOnFail = [] } = e

  const indentLevel = 2
  const indent = ' '.repeat(indentLevel)

  switch (type) {
  case 'test':
    if (state==='start') {
      // Group title
      if (e.group && prevGroup!==e.group){
        console.log(`\n${gray}${e.group}${reset}`)
        prevGroup = e.group
      }
      // Test title
      console.log(`\n${
        ' '.repeat(indentLevel - (id+'').length + 1)
      }${gray}${id}${reset}  ${title}`)
    }
    break
  case 'assertion':
    console.log(`${indent}${ ok ? green+'✓'+gray : red+'x' }  ${title}${reset}`)
    if (!ok && logOnFail.length) {
      console.log()
      console.log(...logOnFail)
      console.log()
    }
    break
  case 'tests':
    if (state==='start') {
      if (title) {
        console.log()
        console.log(title)
      }
      return
    }

    console.log()
    if (!fails) {
      console.log(`${indent}${blue}All ${passes} test${passes!==1 ? 's' : ''} passed${reset}`)
    } else {
      if (passes) console.log(
        `${indent}${green}Passed ${passes} test${passes!==1 ? 's' : ''}${reset}`
      )
      console.log(`${indent}${red}Failed ${fails} test${fails!==1 ? 's' : ''}${reset}`)
    }
    console.log()
    break
  }
}

module.exports = reporter