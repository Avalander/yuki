const test = require('tape')

const makeMemory = require('../memory')


// memory

test('memory.get returns the same object for the same key', t => {
	t.plan(1)
	const memory = makeMemory()
	const first = memory.get('1')
	const second = memory.get('1')
	t.same(first, second)
})

test('memory.get returns different objects for different keys', t => {
	t.plan(1)
	const memory = makeMemory()
	const first = memory.get('1')
	const second = memory.get('2')
	t.notSame(first, second)
})

test('memory.get retrieves falsey values', t => {
	t.plan(1)
	const memory = makeMemory().get('1')
	const value = 0
	memory.set('test', value)
	const retrieved = memory.get('test')
	t.same(value, retrieved)
})


// ChannelMemory

test('ChannelMemory.get returns default value if empty', t => {
	t.plan(1)
	const memory = makeMemory().get('1')
	const result = memory.get('ponies', [])
	t.deepEqual(result, [])
})

test('ChannelMemory.get returns previous value if it has been set', t => {
	t.plan(1)
	const memory = makeMemory().get('1')
	memory.set('ponies', [ 'Twilight Sparkle' ])
	const result = memory.get('ponies')
	t.deepEqual(result, [ 'Twilight Sparkle' ])
})