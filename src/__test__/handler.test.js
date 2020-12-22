const test = require('tape')

const makeHandler = require('src/handler')


// Mocks

const cmdExpectRun = (t, message = 'Invoked command handler') => () => {
	t.pass(message)
	return true
}

const cmdExpectNotRun = (t, message = 'Invoked command handler') => () => t.fail(message)

const cmdNoHandler = (t, message = 'Invoked command handler') => () => t.pass(message)

const cmdThrowError = () => {
	throw new Error('ಠ_ಠ')
}

const cmdRejectError = () => Promise.reject(new Error('ಠ_ಠ'))

const client = {
	user: {
		id: 1,
	},
}

const userAuthor = {
	id: 2,
	bot: false,
}


// handler test

const noRunHandler = t => makeHandler({
	client,
	commands: [ cmdExpectNotRun(t) ],
	store: () => {},
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
	store: () => {},
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
		get: () => {},
	},
	store: () => {},
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
				t.equal(text, `Sorry, I did not understand your request.`),
		},
		content: 'test',
	}
	runNoCmdHandler(t) (message)
})

const runErrorCmdHandler = cmd => makeHandler({
	client,
	commands: [ cmd ],
	memory: {
		get: () => {},
	},
	store: () => {},
})

;([
	[ 'throws error', cmdThrowError ],
	[ 'rejects', cmdRejectError ],
]).forEach(([ s, cmdHandler ]) => {
	test(`handler sends error message when command ${s}`, t => {
		t.plan(1)
		const message = {
			author: userAuthor,
			isMentioned: () => true,
			channel: {
				id: '123',
				send: text => {
					t.equal(text, `Sorry, I could not process your request.\n> Error: ಠ_ಠ`)
				},
			},
			content: 'test',
		}
		runErrorCmdHandler(cmdHandler) (message)
	})
})
