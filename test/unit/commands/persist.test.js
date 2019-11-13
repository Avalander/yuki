const tap = require('tap')

const {
  save,
  recall,
  forget,
} = require('commands/persist')

const { runWith } = require('./helpers')


// Mocks

const message = (send = () => {}) => ({
	channel: { send },
})

const withStore = ({ save, load, remove }) => ({
	store: {
		save,
		load,
		remove,
	}
})


// test save

tap.test('persist.save', t => {
  ([
    [ 'store pony: Twilight Sparkle', 'pony', 'Twilight Sparkle' ],
    [ 'store pony : Twilight Sparkle', 'pony', 'Twilight Sparkle' ],
    [ 'store pony:Twilight Sparkle', 'pony', 'Twilight Sparkle' ],
    [ 'store pony :Twilight Sparkle', 'pony', 'Twilight Sparkle' ],
    [ 'store ponies : [ "Twilight Sparkle", "Rainbow Dash" ]', 'ponies', '[ "Twilight Sparkle", "Rainbow Dash" ]' ],
  ]).forEach(([ cmd, key, value ]) =>
    t.test(`'${cmd}' invokes store.save with (${key}, ${value})`, t => {
      const runSave = runWith(save, {
        message: message(text => t.same(text, 'I will remember that.')),
        options: withStore({
          save: (k, v) => {
            t.same(k, key)
            t.same(v, value)
            return Promise.resolve()
          }
        }),
      })

      return t.resolves(runSave(cmd))
        .then(() => {
          t.end()
        })
    })
  )

  t.test('save logs errors to the console when store.save fails', t => {
    const runSave = runWith(save, {
      message: message(),
      options: withStore({
        save: () => Promise.reject('¯\\_(ツ)_/¯'),
      }),
    })

    return t.resolves(runSave('store pony: Twilight Sparkle'))
      .then(() => {
        t.end()
      })
  })

  t.end()
})


// test recall

tap.test('persist.recall', t => {
  t.test('sends the value returned by store.load', t => {
    const runRecall = runWith(recall, {
      message: message(text => t.same(text, 'Twilight Sparkle')),
      options: withStore({
        load: key => {
          t.same(key, 'pony')
          return Promise.resolve('Twilight Sparkle')
        },
      }),
    })

    return t.resolves(runRecall('read pony'))
      .then(() => {
        t.end()
      })
  })

  ;([
    [ 'rejects', Promise.reject('ಠ_ಠ') ],
    [ 'resolves with null value', Promise.resolve(null) ],
    [ 'resolves with undefined value', Promise.resolve(undefined) ],
  ]).forEach(([ s, loadResult ]) => {
    t.test(`sends error when store.load ${s}`, t => {
      const runRecall = runWith(recall, {
        message: message(text => t.same(text, 'I have no recollection of that.')),
        options: withStore({
          load: () => loadResult,
        }),
      })

      return t.resolves(runRecall('read pony'))
        .then(() => {
          t.end()
        })
    })
  })

  t.end()
})


// test forget

tap.test('persist.forget', t => {
  t.test('Removes a file by key', t => {
    const runForget = runWith(forget, {
      message: message(text => t.same(text, 'Memory of pony has been erased.')),
      options: withStore({
        remove: key => {
          t.same(key, 'pony')
          return Promise.resolve()
        }
      }),
    })

    return t.resolves(runForget('remove pony'))
      .then(() => {
        t.end()
      })
  })

  t.test('Sends error when remove rejects', t => {
    const runForget = runWith(forget, {
      message: message(text => t.same(text, 'I could not delete the specified data.')),
      options: withStore({
        remove: () => Promise.reject('ಠ_ಠ'),
      }),
    })

    return t.resolves(runForget('remove pony'))
      .then(() => {
        t.end()
      })
  })

  t.end()
})
