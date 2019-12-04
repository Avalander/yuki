const test = require('tape')

const { makePipe, textEquals, textContains, textMatches, authorIsAdmin, checkClearance } = require('../util')

//makePipe
test('makePipe should use textEquals when first argument is a string', t => {
	t.plan(1)
	makePipe('potato', t.pass) ('potato', null, null)
})

test('makePipe should not invoke next function when string doesn\'t equal the text', t => {
	t.plan(1)
	const result = makePipe('potato', t.fail) ('cabbage', null, null)
	t.false(result)
})

test('makePipe should use textMatches when first argument is a regular expression', t => {
	t.plan(1)
	makePipe(/roll \d+d\d+/, t.pass) ('roll 2d6', null, null)
})

test('makePipe should not invoke next function when text doesn\'t match regular expression', t => {
	t.plan(1)
	const result = makePipe(/roll \d+d\d+/, t.fail) ('roll potatoes', null, null)
	t.false(result)
})

test('makePipe invokes first function', t => {
	t.plan(1)
	makePipe(t.pass) (null, null, null)
})

test('makePipe stops when one function returns false', t => {
	t.plan(1)
	const result = makePipe((t, m, o, next) => next(), (t, m, o, next) => next(), () => false, t.fail) (null, null, null)
	t.false(result)
})

test('makePipe executes all functions if none returns false', t => {
	t.plan(1)
	makePipe((t, m, o, next) => next(), (t, m, o, next) => next(), (t, m, o, next) => next(), (t, m, o, next) => next(), t.pass) (null, null, null)
})

test('makePipe throws error if first argument is not string, regex or function', t => {
	t.plan(1)
	t.throws(makePipe(12, t.fail))
})


// textEquals

test('textEquals should invoke next when text is equal to expected', t => {
	t.plan(1)
	textEquals('potato') ('potato', null, null, () => t.pass())
})

test('textEquals should return false when text is not equal to expected', t => {
	t.plan(1)
	const result = textEquals('potato') ('carrot', null, null, () => t.fail())
	t.false(result)
})

test('textEquals should invoke next when text is equal to one option', t => {
	t.plan(1)
	textEquals('potato', 'carrot', 'onion') ('carrot', null, null, () => t.pass())
})

test('textEquals should return false when text is not equal to any option', t => {
	t.plan(1)
	const result = textEquals('potato', 'carrot', 'onion') ('apple', null, null, () => t.fail())
	t.false(result)
})


// textContains

test('textContains should invoke next when text contains expected', t => {
	t.plan(1)
	textContains('twilight') ('twilight sparkle', null, null, () => t.pass())
})

test('textContains should invoke next when text equals expected', t => {
	t.plan(1)
	textContains('twilight') ('twilight', null, null, () => t.pass())
})

test('textContains should return false when text does not contain expected', t => {
	t.plan(1)
	const result = textContains('twilight') ('twi', null, null, () => t.fail())
	t.false(result)
})


// textMatches

test('textMatches should invoke next when text matches regex', t => {
	t.plan(1)
	textMatches(/roll \dd\d+/) ('roll 3d12', null, null, () => t.pass())
})

test('textMatches should return false when text does not match regex', t => {
	t.plan(1)
	const result = textMatches(/roll \dd\d+/) ('roll 3e8', null, null, () => t.fail())
	t.false(result)
})


// authorIsAdmin

test('authorIsAdmin should invoke next when author is admin', t => {
	t.plan(1)
	const message = {
		author: { id: 1 }
	}
	const settings = {
		admins: [ 1 ]
	}
	authorIsAdmin('ponies', message, { settings }, () => t.pass())
})

test('authorIsAdmin should deny request when author is not admin', t => {
	t.plan(1)
	const message = {
		author: { id: 2 },
		channel: {
			send: (text) => t.equal(text, 'Request denied.'),
		},
	}
	const settings = {
		admins: [ 1 ]
	}
	authorIsAdmin('ponies', message, { settings }, () => t.fail())
})

//checkClearance

test('checkClearance should invoke next author role is GM or similar', t => {
	t.plan(3)
	const message = {
		guild: {
			roles: [{ 
				name: 'GM',
				members: new Set([ 1, 2 ]),
			}, { 
				name: 'Game Master',
				members: new Set([ 3 ]),
			}, { 
				name: 'Narrator',
				members: new Set([ 4 ]),
			}],
		},
		author: { id: 1 },
	}
	checkClearance(message, t.pass)
	message.author.id = 3
	checkClearance(message, t.pass)
	message.author.id = 4
	checkClearance(message, t.pass)
})

test('checkClearance should deny request when author is not GM or similar', t => {
	t.plan(1)
	const message = {
		guild: {
			roles: [{ 
				name: 'GM',
				members: new Set([ 1, 2 ]),
			}],
		},
		author: { id: 'potato' },
	}
	const result = checkClearance(message, t.fail)
	t.equal(result, 'You do not have clearance to perform that action.')
})