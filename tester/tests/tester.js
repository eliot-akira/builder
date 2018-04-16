const tester = require('../index')

test('Tester', it => new Promise((resolve, reject) => {
  const t = tester(false)
  t(() => setTimeout(() => {
    it('Waits on test to finish', true)
    resolve()
  }, 1000)
  )
  t(() => it('Runs callback', true))
  t(async () => it('Runs async callback', true))
  t(() => new Promise((resolve, reject) => {
    it('Runs promise', true)
    resolve()
  }))
  t.all()
}))

test('Assertion', async it => {
  const t = tester(false)
  t(i => {
    i('', true)
  })
  const result = await t.all()
  it('Passes on true ', !result.fails, result)
  t(i => i('', false))
  it('Fails on false', (await t.all()).fails)
  it('Results are cleared after test.all()', !(await t.all()).fails)
})
