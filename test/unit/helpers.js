module.exports.each = (t, cases) => (text, fn) =>
	cases.forEach(c => {
		const description = makeDescription(text, c)
		t.test(description, t => fn(t, c))
	})

const makeDescription = (text, args) => {
	const values = Array.isArray(args)
		? args
		: [ args ]
	return values.reduce((prev, v) => prev.replace('{}', v), text)
}

module.exports.runWith = (cmd, {
	text,
	message,
	options,
}) => (text_ = text, message_ = message, options_ = options) =>
		cmd(text_, message_, options_)
