module.exports.makePipe = (first, ...fns) => ({
	export: fn => (text, message, options) => {
		const next = i => stop =>
			!stop && (fns[i] && fns[i]([ text, message, options ], next(i + 1)) || fn(text, message, options))
		return first([ text, message, options ], next(0))
	}
})

module.exports.textEquals = (...expect) => ([ text ], next) =>
	(expect.includes(text)
		? next()
		: false
	)

module.exports.textContains = expect => ([ text ], next) =>
	(text.includes(expect)
		? next()
		: false
	)

module.exports.textMatches = expect => ([ text ], next) =>
	(expect.test(text)
		? next()
		: false
	)

module.exports.authorIsAdmin = ([ text, message, { settings }], next) =>
	(settings.admins.includes(message.author.id)
		? next()
		: message.channel.send('Request denied.')
	)
