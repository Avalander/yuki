const child_process = require('child_process')

const ACK = 'はい'
const COMMANDS = ['restart']

module.exports = (text, message, { settings }) => {
	if (COMMANDS.includes(text)) {
		if (!settings.admins.includes(message.author.id)) {
			return message.channel.send('Request denied.')
		}
		return message.channel.send(ACK)
			.then(() => {
				console.log(`[${process.pid}] Starting new process...`)
				const result = child_process.execSync('npm run bot:start').toString()
				console.log(result)
				console.log(`[${process.pid}] Exiting now...`)
				process.exit(0)
			})
	}
}