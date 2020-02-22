const { get } = require('../request')

const {
	makePipe,
	textMatches,
} = require('./util')


const fetchJoke = () => get({
	host: 'icanhazdadjoke.com',
	headers: {
		Accept: 'application/json',
	},
})

const retry = (fn, predicate, times = 10) =>
	fn()
		.then(data => predicate(data)
			? data
			: times > 0
			? retry(fn, predicate, times - 1)
			: Promise.reject({ success: false, data })
		)

const handler = (_, message, { memory }) => {
	const active_period = Date.now() - (24 * 60 * 60 * 1000)
	const latest_jokes = memory.get('joke:latest-jokes', [])
		.filter(({ timestamp }) => timestamp > active_period)

	const is_new_joke = ({ id }) =>
		latest_jokes.find(j => j.id == id) == null
	
	return retry(fetchJoke, is_new_joke, 3)
		.catch(error => error.success === false
			? Promise.resolve(error.data)
			: Promise.reject(error)
		)
		.then(({ id, joke }) => Promise.all([
			message.channel.send(joke),
			memory.set('joke:latest-jokes', latest_jokes.concat({
				id,
				joke,
				timestamp: Date.now(),
			})),
		]))
}

module.exports = makePipe(
	textMatches(/(send me a )?joke( please)?(\.|!)?/i),
	handler
)
