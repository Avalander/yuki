const { makePipe, textEquals, authorIsAdmin } = require('./util')


module.exports = makePipe(
	textEquals('test'),
	authorIsAdmin,
	(text, message) => {
		return message.channel.send('It works.')
	}
)