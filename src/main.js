'use strict'

const { version } = require('../package.json')
const { bot_token, ...options } = require('../settings.json')

const path = require('path')

const Discord = require('discord.js')

const makeMemory = require('./memory')
const { makeStore } = require('./store')
const commands = require('./commands')
const initModules = require('./modules')
const makeHandler = require('./handler')


const client = new Discord.Client()
const memory = makeMemory()

const base_path = path.resolve(__dirname, '..', 'data')
const store = makeStore(base_path)


const startBot = modules => {
	const handler = makeHandler({
		client,
		commands: commands.concat(modules.commands),
		memory,
		settings,
		store,
	})

	client.on('message', handler)

	console.log(`[${process.pid}] I am ready.`)
}

client.on('ready', () => {
	const settings = {
		...options,
		version,
		started_on: Date.now(),
	}

	initModules({ client, memory, settings, store })
		.then(startBot)
})

client.on('error', error => {
	console.error(error)
})

client.login(bot_token)
