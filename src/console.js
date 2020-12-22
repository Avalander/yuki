const readline = require('readline')
const path = require('path')

const commands = require('src/commands')
const makeMemory = require('src/memory')
const makeHandler = require('src/handler')
const { makeStore } = require('src/store')

const base_path = path.resolve(__dirname, 'data')
const store = makeStore(base_path)



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
	},
}
const memory = makeMemory()

const handler = makeHandler({
	client,
	commands,
	memory,
	settings,
	store,
})

const channel = {
	send: text => {
		console.log(`yuki> ${text}`)
		return Promise.resolve()
	},
	id: 'the-channel',
}

const yuki = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

yuki.on('line', line => {
	const message = {
		author: {
			id: line.startsWith('admin>') ? 2 : 3,
			bot: false,
		},
		content: line.replace(/^admin>(\s)?/, ''),
		channel,
		isMentioned: () => true,
	}
	handler(message)
})

console.log('yuki> I am ready.')
