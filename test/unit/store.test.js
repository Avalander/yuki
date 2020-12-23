const tap = require('tap')

const { each } = require('helpers')

const { factory } = require('src/store')


// Mocks

const noop = () => {}

const resolveWith = value => Promise.resolve(value)


// test load

tap.test('load', t => {
	t.test('fails with Invalid path when trying to access a file outside the channel folder', t => {
		const store = factory({}) ('data') ('1')
		
		store.load('../2')
			.catch(err => {
				t.equal(err.message, `Invalid path 'data/2'`)
				t.end()
			})
	})

	t.test('calls readFile with the given key', t => {
		const store = factory({
			readFile: (dir, options) => {
				t.equal(dir, 'data/1/pony')
				t.deepEqual(options, { encoding: 'utf8' })
				return Promise.resolve('Twilight Sparkle')
			},
		}) ('data') ('1')

		store.load('pony')
			.then(pony => {
				t.equal(pony, 'Twilight Sparkle')
				t.end()
			})
  })
  
  t.end()
})


// test save & append

each(tap, [
	[ 'save', { encoding: 'utf8' }],
	[ 'append', { mode: 'a', encoding: 'utf8' }],
]) ('', (t, [ fn, options ]) => {
	t.test('fails with Invalid path when trying to access a file outside the channel folder', t => {
		const store = factory({
			mkdir: resolveWith,
		})('data')('1')

		store[fn]('../2/pony', 'Twilight Sparkle')
			.catch(err => {
				t.equal(err.message, `Invalid path 'data/2/pony'`)
				t.end()
			})
	})

	t.test('creates the directory for the channel', t => {
		const store = factory({
			mkdir: x => {
				t.equal(x, 'data/1')
				return Promise.resolve(x)
			},
			writeFile: noop,
		})('data')('1')

		store[fn]('pony', 'Twilight Sparkle')
			.then(() => t.end())
	})

	t.test('invokes writeFile with the given value', t => {
		const store = factory({
			mkdir: resolveWith,
			writeFile: (key, data, options_) => {
				t.equal(key, 'data/1/pony')
				t.equal(data, 'Twilight Sparkle')
				t.deepEqual(options_, options)
			},
		})('data')('1')

		store[fn]('pony', 'Twilight Sparkle')
			.then(() => t.end())
    })
    
    t.end()
})


// test remove

tap.test('remove', t => {
	t.test('fails with Invalid path when trying to access a file outside the channel folder', t => {
		const store = factory({})('data')('1')

		store.remove('../2/pony')
			.catch(err => {
				t.equal(err.message, `Invalid path 'data/2/pony'`)
				t.end()
			})
	})

	t.test('invokes removeFile', t => {
		const store = factory({
			removeFile: x => {
				t.equal(x, 'data/1/pony')
				return Promise.resolve(x)
			},
		}) ('data') ('1')

		store.remove('pony')
			.then(() => t.end())
  })
  
  t.end()
})
