'use strict'

module.exports = ({ client, commands, memory, settings, store }) => {
	const handler = handle(commands, memory, settings, store)
	return message => canHandle(message, client)
		? handler(message, client)
		: false
}

const isBot = (message, client_id) =>
	message.author.id === client_id || message.author.bot

const isSentToYuki = (message, yuki_user) =>
	message.isMentioned(yuki_user) || message.channel.type === 'dm'

const canHandle = (message, client) =>
	!isBot(message, client.user.id) && isSentToYuki(message, client.user)

const handle = (commands, memory, settings, store) => (message, client) => {
	const text = message.content.replace(`<@${client.user.id}>`, '').trim()
	const options = {
		client,
		settings,
		memory: memory.get(message.channel.id),
		store: store(message.channel.id),
	}
	return runAsync(commands, text, message, options)
		.then(processed => processed
			? null
			: message.channel.send(`Sorry, I did not understand your request.`)
		)
		.catch(error => {
			console.error(error)
			message.channel.send(`Sorry, I could not process your request.\n> ${error}`)
		})
}

const runAsync = (commands, ...args) =>
	commands.reduce(
		(prev, cmd) => prev.then(processed => Promise.all([ processed, cmd(...args) ]))
			.then(([ processed, result ]) => result || processed),
		Promise.resolve()
	)
