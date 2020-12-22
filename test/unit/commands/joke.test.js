const tap = require('tap')

const {
	each,
	runWith,
} = require('helpers')

const { factory } = require('commands/joke')


// Mocks

const message = (send = () => {}) => ({
	channel: {
		send,
	},
})

const DEFAULT_JOKE = {
	id: '123',
	joke: 'Milk makes your bones strong.',
}

const getJoke = () => Promise.resolve(DEFAULT_JOKE)

const getJokeSeries = (jokes) => {
	let options = jokes
	return () => {
		const [ joke, ...rest ] = options
		options = rest
		return joke != null
			? Promise.resolve(joke)
			: Promise.reject('No more jokes')
	}
}

const fn = ({ a = 12, b = false} = {}) => ({ a, b })

const withMemory = ({
	get = () => [],
	set = () => {},
} = {}) => ({
	memory: {
		get,
		set,
	},
})

tap.test('joke', t => {
	each(t, [
		[ 'joke' ],
		[ 'send me a joke' ],
		[ 'send me a joke please' ],
		[ 'send me a joke.' ],
		[ 'joke!' ],
	]) ('{} invokes the joke command', (t, [ cmd ]) => {
		const joke = factory({
			get: getJoke,
		})
		const runJoke = runWith(joke, {
			message: message(text => t.same(text, 'Milk makes your bones strong.')),
			options: withMemory(),
		})

		return t.resolves(runJoke(cmd))
			.then(() => {
				t.end()
			})
	})

	each(t, [
		[ 'send me a' ],
		[ 'jokke' ],
		[ 'potato' ],
	]) ('{} does not invoke the joke command', (t, [ cmd ]) => {
		const joke = factory({
			get: getJoke,
		})
		const runJoke = runWith(joke, {})

		t.equal(runJoke(cmd), false)
		t.end()
	})

	t.test('Calls the joke api again if the joke has been sent in the past 24 hours', t => {
		const joke = factory({
			get: getJokeSeries([{
				id: '1',
				joke: 'Potato',
			}, {
				id: '2',
				joke: 'Tomato',
			}]),
		})
		const runJoke = runWith(joke, {
			message: message(text => t.equal(text, 'Tomato')),
			options: withMemory({
				get: () => [{
					id: '1',
					timestamp: Date.now() - 1000,
				}],
			})
		})

		return t.resolves(runJoke('joke'))
			.then(() => {
				t.end()
			})
	})

	t.test('Saves the joke in the memory', t => {
		const realNow = Date.now
		Date.now = () => 1000

		const joke = factory({
			get: getJoke,
		})
		const runJoke = runWith(joke, {
			message: message(text => t.equal(text, 'Milk makes your bones strong.')),
			options: withMemory({
				set: (key, value) => {
					t.equal(key, 'joke:latest-jokes')
					t.deepEqual(value, [{
						...DEFAULT_JOKE,
						timestamp: 1000,
					}])
				}
			})
		})
		return t.resolves(runJoke('joke'))
			.then(() => {
				Date.now = realNow
				t.end()
			})
	})

	t.test('Removes old jokes from the memory', t => {
		const realNow = Date.now
		Date.now = () => 1000 + (24 * 60 * 60 * 1000)

		const joke = factory({
			get: getJoke,
		})
		const runJoke = runWith(joke, {
			message: message(text => t.equal(text, DEFAULT_JOKE.joke)),
			options: withMemory({
				get: () => [{
					id: '23',
					timestamp: 53,
				}],
				set: (_, value) => {
					t.deepEqual(value, [{
						...DEFAULT_JOKE,
						timestamp: 24 * 60 * 60 * 1000 + 1000,
					}])
				}
			})
		})
		return t.resolves(runJoke('joke'))
			.then(() => {
				Date.now = realNow
				t.end()
			})
	})

	t.test('Sends a repeated joke after retrying three times', t => {
		const jokes = [{
			id: '1',
			joke: 'Potato',
		}, {
			id: '2',
			joke: 'Tomato',
		}, {
			id: '3',
			text: 'Carrot',
		}, {
			id: '4',
			joke: 'Aubergine',
		}]
		const joke = factory({
			get: getJokeSeries(jokes)
		})
		const runJoke = runWith(joke, {
			message: message(text => t.equals(text, 'Aubergine')),
			options: withMemory({
				get: () => jokes.map(x => ({
					...x,
					timestamp: Date.now(),
				}))
			})
		})

		return t.resolves(runJoke('joke'))
			.then(() => {
				t.end()
			})
	})

	t.test('Fails if get joke rejects', t => {
		const joke = factory({
			get: () => Promise.reject({
				statusCode: 503,
				message: '¯\\_(ツ)_/¯',
			}),
		})
		const runJoke = runWith(joke, {
			message: message(text => t.equal(text, 'Something went wrong\n503 - ¯\\_(ツ)_/¯')),
			options: withMemory(),
		})
		return t.resolves(runJoke('joke'))
			.then(() => {
				t.end()
			})
	})

	t.end()
})
