const SOURCE_URL = 'https://github.com/Avalander/yuki'

const COMMANDS = [ 'source', 'source.' ]


module.exports = (text, message) => {
	if (COMMANDS.includes(text.toLowerCase())) {
		message.channel.send(SOURCE_URL)
		return true
	}
}
