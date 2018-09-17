module.exports = (text, message, { settings }) => {
	if (text.toLowerCase() === 'version') {
		return message.channel.send(`The current version of this interface is ${settings.version}.`)
	}
}