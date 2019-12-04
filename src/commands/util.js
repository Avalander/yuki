module.exports.makePipe = (first, ...fns) => (text, message, options) => {
	const firstFn = evalFirst(first)
	const next = i => stop =>
		!stop && fns[i] && fns[i](text, message, options, next(i + 1))
	return firstFn(text, message, options, next(0))
}

const evalFirst = first => {
	if (typeof first === 'function') return first
	if (typeof first === 'string' || Array.isArray(first)) return exports.textEquals(first)
	if (first instanceof RegExp) return exports.textMatches(first)
	throw new Error(`Expected function, string or regexp, but found ${typeof first}`)
}

module.exports.textEquals = (...expect) => (text, message, options, next) =>
	(expect.includes(text)
		? next()
		: false
	)

module.exports.textContains = (...expect) => (text, message, options, next) =>
	(expect.some(x => text.toLowerCase().includes(x))
		? next()
		: false
	)

module.exports.textMatches = expect => (text, message, options, next) =>
	(expect.test(text)
		? next()
		: false
	)

module.exports.authorIsAdmin = (text, message, { settings }, next) =>
	(settings.admins.includes(message.author.id)
		? next()
		: message.channel.send('Request denied.')
	)

module.exports.checkClearance = (message, next) =>
	(checkRole(message)
		? next()
		: 'You do not have clearance to perform that action.'
	)

const checkRole = (message) => {
	return message.guild.roles.filter(({ name }) => [ 'GM', 'Game Master', 'Narrator' ].includes(name))
		.some(({ members }) => members.has(message.author.id))
}
