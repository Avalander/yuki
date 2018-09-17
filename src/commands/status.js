const SECOND = 1000
const MINUTE = SECOND * 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24
const WEEK = DAY * 7

const TIME_UNITS = [
	[ WEEK, 'week', 'weeks' ],
	[ DAY, 'day', 'days' ],
	[ HOUR, 'hour', 'hours' ],
	[ MINUTE, 'minute', 'minutes' ],
	[ SECOND, 'second', 'seconds' ],
]

const COMMANDS = [ 'status', 'status.', `what's your status?`, 'what is your status?' ]


module.exports = (text, message, { client, settings }) => {
	if (COMMANDS.includes(text.toLowerCase())) {
		const uptime = uptimeToText(Date.now() - settings.started_on)
		message.channel.send(`I have been functioning according to the specified parameters for the past ${uptime}.`)
		return true
	}
}

const uptimeToText = value => {
	const text_parts = []
	let remainder = value
	for (let [ unit, name, plural ] of TIME_UNITS) {
		const result = durationTo(unit, remainder)
		if (result[0] > 0) {
			text_parts.push(`${result[0]} ${result[0] > 1 ? plural : name}`)
		}
		remainder = result[1]
	}
	return joinTimeTexts(text_parts)
}

const durationTo = (value, duration) => {
	const division = Math.floor(duration / value)
	const remainder = duration % value
	return [ division, remainder ]
}

const joinTimeTexts = text_parts =>
	(text_parts.length > 2
		? [
			text_parts.slice(0, text_parts.length - 1).join(', '),
			text_parts[text_parts.length - 1]
		].join(' and ')
		: text_parts.join(' and ')
	)
