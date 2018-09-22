const readline = require('readline')

const commands = require('./commands')
const makeMemory = require('./memory')


const settings = {
	version: 'dev',
	started_on: Date.now(),
	admins: [
		2,
	],
}
const client = {
	user: {
		id: 1,
	}
}
const memory = makeMemory().get(1)

const channel = {
	send: text => {
		console.log(`yuki> ${text}`)
		return Promise.resolve()
	}
}

const yuki = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

yuki.on('line', content => {
	const message = {
		author: {
			id: content.startsWith('admin>') ? 2 : 3,
			bot: false,
		},
		content,
		channel,
	}
	const text = content.replace(/^admin>(\s)?/, '')

	const processed = commands.reduce(
		(processed, cmd) => cmd(text, message, { client, settings, memory }) || processed,
		false
	)
	if (!processed) {
		message.channel.send(`Sorry, I didn't understand your request.`)
	}
})

console.log('yuki> I am ready.')
