const test = require('tape')

const { textEquals, textContains, textMatches, authorIsAdmin } = require('../util')


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
	const result = textMatches(/roll \dd\d+/) ('roll 3e8', null, null, () => fail())
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