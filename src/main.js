'use strict'

const { version } = require('../package.json')
const { bot_token, ...options } = require('../settings.json')

const Discord = require('discord.js')
const makeMemory = require('./memory')
const commands = require('./commands')
const makeHandler = require('./handler')


const client = new Discord.Client()
const memory = makeMemory()

client.on('ready', () => {
	const settings = {
		...options,
		version,
		started_on: Date.now(),
	}
	const handler = makeHandler({
		client,
		commands,
		memory,
		settings,
	})

	client.on('message', handler)

	console.log(`[${process.pid}] I am ready.`)
})

client.on('error', error => {
	console.error(error)
})

client.login(bot_token)
