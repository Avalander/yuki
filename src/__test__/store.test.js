const test = require('tape')

const { factory } = require('../store')


// test load

test('load', t => {
  t.test('fails with Invalid path when trying to access a file outside the channel folder', t => {
    t.plan(1)

    const store = factory({}) ('data') ('1')
    
    store.load('../2')
      .catch(err => {
        t.equal(err.message, `Invalid path 'data/2'`)
        t.end()
      })
  })

  t.test('calls readFile with the given key', t => {
    t.plan(3)

    const store = factory({
      readFile: (dir, options) => {
        t.equal(dir, 'data/1/pony')
        t.deepEqual(options, { encoding: 'utf8' })
        return Promise.resolve('Twilight Sparkle')
      }
    }) ('data') ('1')

    store.load('pony')
      .then(pony => {
        t.equal(pony, 'Twilight Sparkle')
        t.end()
      })
  })
})
