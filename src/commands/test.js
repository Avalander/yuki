const { makePipe, textEquals, authorIsAdmin } = require('src/commands/util')


module.exports = makePipe(
	textEquals('test'),
	authorIsAdmin,
	(text, message) => {
		return message.channel.send('It works.')
	}
)