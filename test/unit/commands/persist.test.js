const tap = require('tap')

const {
  save,
  recall,
  forget,
} = require('commands/persist')


// Mocks

const message = send => ({
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
    tap.test(`${cmd} invokes store.save with (${key}, ${value})`, t => {
      t.resolves(save(
        cmd,
        message(text => t.same(text, 'I will remember that.')),
        withStore({
          save: (k, v) => {
            t.same(k, key)
            t.same(v, value)
            return Promise.resolve()
          }
        })))
        .then(() => {
          t.end()
        })
    })
  )

  t.test('save logs errors to the console when store.save fails', t => {
    return t.resolves(save(
      'store pony: Twilight Sparkle',
      message(() => {}),
      withStore({
        save: () => Promise.reject('¯\\_(ツ)_/¯'),
      })))
      .then(() => {
        t.end()
      })
  })

  t.end()
})


// test recall

tap.test('persist.recall', t => {
  t.test('sends the value returned by store.load', t => {
    return t.resolves(recall(
      'read pony',
      message(text => t.same(text, 'Twilight Sparkle')),
      withStore({
        load: key => {
          t.same(key, 'pony')
          return Promise.resolve('Twilight Sparkle')
        },
      })
    ))
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
      return t.resolves(recall(
        'read pony',
        message(text => t.same(text, 'I have no recollection of that.')),
        withStore({
          load: () => loadResult,
        }),
      ))
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
    t.resolves(forget(
      'remove pony',
      message(text => t.same(text, 'Memory of pony has been erased.')),
      withStore({
        remove: key => {
          t.same(key, 'pony')
          return Promise.resolve()
        }
      })
    ))
    .then(() => {
      t.end()
    })
  })

  t.test('Sends error when remove rejects', t => {
    t.resolves(forget(
      'remove pony',
      message(text => t.same(text, 'I could not delete the specified data.')),
      withStore({
        remove: () => Promise.reject('ಠ_ಠ'),
      })
    ))
    .then(() => {
      t.end()
    })
  })

  t.end()
})
