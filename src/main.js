require('dotenv').config()

const Discord = require('discord.js')
const commands = require('./commands')


const { BOT_TOKEN } = process.env
const client = new Discord.Client()

client.on('ready', () => {
	client.started_on = Date.now()
	console.log('I am ready.')
})

client.on('message', message => {
	if (message.isMentioned(client.user)) {
		const text = message.content.replace(`<@${client.user.id}>`, '').trim()
		const processed = commands.reduce(
			(processed, cmd) => cmd(text, message, client) || processed,
			false
		)
		if (!processed) {
			message.channel.send(`Sorry, I didn't understand your request.`)
		}
	}
})

client.login(BOT_TOKEN)
