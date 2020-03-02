'use strict'

const { get } = require('../request')

const {
	makePipe,
	retry,
	textMatches,
} = require('../commands/util')

const MEMORY_KEY = 'joke:latest-jokes'


const factory = ({ get }) => ({ memory }) => {
	const fetchJoke = () => get({
		host: 'icanhazdadjoke.com',
		headers: {
			Accept: 'application/json',
		},
	})
	
	const sendJoke = (_, message) => {
		const active_period = lastDay()
		const latest_jokes = memory.get(MEMORY_KEY, [])
			.filter(({ timestamp }) => timestamp >= active_period)
	 
		return retry(fetchJoke, isNewJoke(latest_jokes), 3)
			.catch(error => error.success === false
				? Promise.resolve(error.data)
				: Promise.reject(error)
			)
			.then(({ id, joke }) => Promise.all([
				message.channel.send(joke),
				memory.set(MEMORY_KEY, latest_jokes.concat({
					id,
					joke,
					timestamp: Date.now(),
				})),
			]))
			.catch(e => {
				console.error('Error', e)
				message.channel.send(`Something went wrong\n${e.statusCode} - ${e.message}`)
			})
	}

	const repeatLastJoke = (_, message) => {
		const jokes = memory.get(MEMORY_KEY, [])
		const last_joke = jokes[jokes.length - 1]
		const text = last_joke != null
			? last_joke.joke
			: 'Data not available.'

		return message.channel.send(text)
	}

	return {
		commands: [
			makePipe(
				textMatches(/^((send|tell) me a )?joke( please)?(\.|!)?$/i),
				sendJoke,
			),
			makePipe(
				textMatches(/^repeat( last)? joke( please)?(\.)?$/i),
				repeatLastJoke,
			)
		],
		shutdown: () => {}
	}
}

module.exports = factory({ get })
module.exports.factory = factory

const isNewJoke = latest_jokes => ({ id }) =>
	latest_jokes.find(j => j.id == id) == null

const lastDay = () =>
	Date.now() - (24 * 60 * 60 * 1000)
