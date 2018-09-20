const { makePipe, textEquals, authorIsAdmin } = require('./util')


module.exports = makePipe(textEquals('test'), authorIsAdmin)
	.export((text, message) => {
		return message.channel.send('It works.')
	})