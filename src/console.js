const readline = require('readline')

const commands = require('./commands')
const makeMemory = require('./memory')
const makeHandler = require('./handler')


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

const handler = makeHandler({
	client,
	commands,
	memory,
	settings,
})

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
