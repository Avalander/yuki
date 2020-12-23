const tap = require('tap')

const meme = require('src/commands/meme')
const { factory } = meme
const { each } = require('helpers')

// Mocks
const message = (send = () => {}) => ({
	channel: {
		send,
	},
})

const MEME = {
	id: '1',
	caption: 'Test Caption',
	image: 'https://i.some-random-api.ml/VM2Dkpp7VX.png',
}

const getMeme = () => Promise.resolve(MEME)
const dontGetMeme = () => Promise.reject()

tap.test('meme', t => {
	each(t, [
		[ 'meme' ],
		[ 'send me a meme' ],
		[ 'fetch a meme for me' ],
	])('invokes meme command', (t, [ cmd ]) => {
		const meme = factory({
			get: getMeme,
		})

		t.resolves(meme(cmd, message(text => t.equal(text, `${MEME.caption} ${MEME.image}`))))
			.then(t.end)
	})

	each(t, [
		[ 'potato' ],
		[ 'meeme' ],
	])('doesn\'t invoke meme command', (t, [ cmd ]) => {
		const meme = factory({
			get: getMeme,
		})
		t.notOk(meme(cmd, message()))
		t.end()
	})

	t.test('fetches data from the API', t => {
		t.resolves(meme('meme', message(text => t.match(text, /^.+\shttps:\/\/.+\.(?:jpg|jpeg|png)$/))))
			.then(t.end)
	})

	t.test('rejection shows a failure message', t => {
		const meme = factory({
			get: dontGetMeme,
		})
		t.resolves(meme('meme', message(text => t.match(text, 'Something went wrong'))))
			.then(t.end)
	})

	t.end()
})