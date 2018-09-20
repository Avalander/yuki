const { version } = require('../package.json')
const { bot_token, ...settings } = require('../settings.json')

const commands = require('./commands')
const readline = require('readline')

settings.version = version
settings.started_on = Date.now()


const client = {
	user: {
		id: 1,
	}
}

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
			id: 2,
			bot: false,
		},
		content,
		channel,
	}

	const processed = commands.reduce(
		(processed, cmd) => cmd(content, message, { client, settings }) || processed,
		false
	)
	if (!processed) {
		message.channel.send(`Sorry, I didn't understand your request.`)
	}
})

console.log('yuki> I am ready.')
