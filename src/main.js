const { version } = require('../package.json')
const { bot_token, ...settings } = require('../settings.json')

const Discord = require('discord.js')
const makeMemory = require('./memory')
const commands = require('./commands')


const client = new Discord.Client()
settings.version = version
const memory = makeMemory()

client.on('ready', () => {
	settings.started_on = Date.now()
	console.log(`[${process.pid}] I am ready.`)
})

client.on('message', message => {
	if (message.author.id === client.user.id || message.author.bot) {
		return
	}
	if (message.isMentioned(client.user) || message.channel.type === 'dm') {
		const text = message.content.replace(`<@${client.user.id}>`, '').trim()
		const options = {
			client,
			settings,
			memory: memory.get(message.channel.id),
		}
		const processed = commands.reduce(
			(processed, cmd) => cmd(text, message, options) || processed,
			false
		)
		if (!processed) {
			message.channel.send(`Sorry, I didn't understand your request.`)
		}
	}
})

client.on('error', error => {
	console.error(error)
})

client.login(bot_token)
