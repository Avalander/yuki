const test = require('tape')

const { textEquals, textContains } = require('../util')


// textEquals

test('textEquals should invoke next when text is equal to expected', t => {
	t.plan(1)
	textEquals('potato') ([ 'potato' ], () => t.pass())
})

test('textEquals should return false when text is not equal to expected', t => {
	t.plan(1)
	const result = textEquals('potato') ([ 'carrot' ], () => t.fail())
	t.false(result)
})

test('textEquals should invoke next when text is equal to one option', t => {
	t.plan(1)
	textEquals('potato', 'carrot', 'onion') ([ 'carrot' ], () => t.pass())
})

test('textEquals should return false when text is not equal to any option', t => {
	t.plan(1)
	const result = textEquals('potato', 'carrot', 'onion') ([ 'apple' ], () => t.fail())
	t.false(result)
})


// textContains

test('textContains should invoke next when text contains expected', t => {
	t.plan(1)
	textContains('twilight') ([ 'twilight sparkle' ], () => t.pass())
})

test('textContains should invoke next when text equals expected', t => {
	t.plan(1)
	textContains('twilight') ([ 'twilight' ], () => t.pass())
})

test('textContains should return false when text does not contain expected', t => {
	t.plan(1)
	const result = textContains('twilight') ([ 'twi' ], () => t.fail())
	t.false(result)
})
