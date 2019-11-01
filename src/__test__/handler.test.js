const test = require('tape')

const makeHandler = require('../handler')


// Mocks

const cmdExpectRun = (t, message = 'Invoked command handler') => () => {
	t.pass(message)
	return true
}

const cmdExpectNotRun = (t, message = 'Invoked command handler') => () => t.fail(message)

const cmdNoHandler = (t, message = 'Invoked command handler') => () => {
	t.pass(message)
	return false
}

const client = {
	user: {
		id: 1,
	}
}

const userAuthor = {
	id: 2,
	bot: false,
}


// handler test

const noRunHandler = t => makeHandler({
	client,
	commands: [ cmdExpectNotRun(t) ],
})

test('handler does not process message when author is bot', t => {
	t.plan(1)
	const message = {
		author: {
			id: 2,
			bot: true,
		},
	}
	const result = noRunHandler(t) (message)
	t.false(result)
})

test('handler does not process message when author is Yuki', t => {
	t.plan(1)
	const message = {
		author: {
			id: 1,
		},
	}
	const result = noRunHandler(t) (message)
	t.false(result)
})

test('handler does not process message when Yuki is not mentioned and channel is not dm', t => {
	t.plan(1)
	const message = {
		author: userAuthor,
		isMentioned: () => false,
		channel: {
			type: 'not-dm',
		},
	}
	const result = noRunHandler(t) (message)
	t.false(result)
})

const runHandler = t => makeHandler({
	client,
	commands: [ cmdExpectRun(t) ],
	memory: {
		get: () => {},
	},
})

test('handler processes message when Yuki is mentioned', t => {
	t.plan(1)
	const message = {
		author: userAuthor,
		isMentioned: () => true,
		channel: {
			id: '123',
		},
		content: 'test',
	}
	runHandler(t) (message)
})

test('handler processes message when type is dm', t => {
	t.plan(1)
	const message = {
		author: userAuthor,
		isMentioned: () => false,
		channel: {
			id: '123',
			type: 'dm',
		},
		content: 'test',
	}
	runHandler(t) (message)
})

const runNoCmdHandler = t => makeHandler({
	client,
	commands: [ cmdNoHandler(t) ],
	memory: {
		get: () => { },
	},
})

test('handler sends error message when command is not recognised', t => {
	t.plan(2)
	const message = {
		author: {
			id: 2,
			bot: false,
		},
		isMentioned: () => true,
		channel: {
			id: '123',
			send: text =>
				t.equal(text, `Sorry, I didn't understand your request.`)
		},
		content: 'test',
	}
	runNoCmdHandler(t) (message)
})
