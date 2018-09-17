const child_process = require('child_process')

const ACK = 'はい'
const COMMANDS = [ 'update' ]

module.exports = (text, message, { settings }) => {
    if (COMMANDS.includes(text)) {
        if (!settings.admins.includes(message.author.id)) {
            return message.channel.send('Request denied.')
        }
        const result = child_process.execSync('npm run bot:update').toString()
        console.log(result)
        return message.channel.send(result)
    }
}