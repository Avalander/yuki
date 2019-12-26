const tap = require('tap')

const {
  authorIsAdmin,
  checkClearance,
  textContains,
  textEquals,
  textMatches,
} = require('commands/util')


// textEquals

tap.test('textEquals', t => {
	t.test('should invoke next when text is equal to expected', t => {
		textEquals('potato') ('potato', null, null, () => t.pass('Invokes next'))
		t.end()
	})

	t.test('should return false when text is not equal to expected', t => {
		const result = textEquals('potato') ('carrot', null, null, () => t.fail())
		t.false(result)
		t.end()
	})

	t.test('should invoke next when text is equal to one option', t => {
		textEquals('potato', 'carrot', 'onion') ('carrot', null, null, () => t.pass('Invokes next'))
		t.end()
	})

	t.test('should return false when text is not equal to any option', t => {
		const result = textEquals('potato', 'carrot', 'onion') ('apple', null, null, () => t.fail())
		t.false(result)
		t.end()
	})

	t.end()
})


// textContains


tap.test('textContains', t => {
	t.test('should invoke next when text contains expected', t => {
		textContains('twilight') ('twilight sparkle', null, null, () => t.pass('Invokes next'))
		t.end()
	})

	t.test('should invoke next when text equals expected', t => {
		textContains('twilight') ('twilight', null, null, () => t.pass('Invokes next'))
		t.end()
	})

	t.test('should return false when text does not contain expected', t => {
		const result = textContains('twilight') ('twi', null, null, () => t.fail())
		t.false(result)
		t.end()
	})

	t.end()
})


// textMatches

tap.test('textMatches', t => {
	t.test('should invoke next when text matches regex', t => {
		textMatches(/roll \dd\d+/) ('roll 3d12', null, null, () => t.pass('Invokes next'))
		t.end()
	})

	t.test('should return false when text does not match regex', t => {
		const result = textMatches(/roll \dd\d+/) ('roll 3e8', null, null, () => t.fail())
		t.false(result)
		t.end()
	})

	t.end()
})


// authorIsAdmin

tap.test('authorIsAdmin', t => {
	t.test('authorIsAdmin should invoke next when author is admin', t => {
		const message = {
			author: { id: 1 }
		}
		const settings = {
			admins: [ 1 ]
		}
		authorIsAdmin('ponies', message, { settings }, () => t.pass())
		t.end()
	})

	t.test('should deny request when author is not admin', t => {
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
		t.end()
	})

	t.end()
})

// checkClearance

tap.test('checkClearance', t => {
	t.test('should invoke next when author is GM or similar', t => {
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
			author: { id: 2 },
		}

		checkClearance(message, t.pass)
		message.author.id = 3
		checkClearance(message, t.pass)
		message.author.id = 4
		checkClearance(message, t.pass)

		t.end()
	})

	t.end()
})
