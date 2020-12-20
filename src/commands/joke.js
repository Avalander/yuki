const { get } = require('request')
const {
	makePipe,
	retry,
	textMatches,
} = require('./util')


const handler = ({ get }) => {
	const fetchJoke = () => get({
		host: 'icanhazdadjoke.com',
		headers: {
			Accept: 'application/json',
		},
	})

	return (_, message, { memory }) => {
		const active_period = Date.now() - (24 * 60 * 60 * 1000)
		const latest_jokes = memory.get('joke:latest-jokes', [])
			.filter(({ timestamp }) => timestamp > active_period)

		const isNewJoke = ({ id }) =>
			latest_jokes.find(j => j.id == id) == null
		
		return retry(fetchJoke, isNewJoke, 3)
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
			.catch(e => {
				console.log('Error', e)
				message.channel.send(`Something went wrong\n${e.statusCode} - ${e.message}`)
			})
	}
}

module.exports = makePipe(
	textMatches(/^((send|tell) me a )?joke( please)?(\.|!)?$/i),
	handler({ get })
)

module.exports.factory = ({ get }) =>
	makePipe(
		textMatches(/(send me a )?joke( please)?(\.|!)?/i),
		handler({ get })
	)
