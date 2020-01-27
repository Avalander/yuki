const tap = require('tap')

const {
  authorIsAdmin,
  checkClearance,
  flatten,
  makePipe,
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

		checkClearance(message, () => t.pass('Invokes next'))
		message.author.id = 3
		checkClearance(message, () => t.pass('Invokes next'))
		message.author.id = 4
		checkClearance(message, () => t.pass('Invokes next'))
		t.end()
	})

	t.test('should deny request when author is not GM or similar', t => {
		const message = {
			guild: {
				roles: [{ 
					name: 'GM',
					members: new Set([ 1, 2 ]),
				}],
			},
			author: { id: 3 },
		}
		const result = checkClearance(message, t.fail)
		t.equal(result, 'You do not have clearance to perform that action.')
		t.end()
	})

	t.end()
})

// makePipe

tap.test('makePipe', t => {
	t.test('should use textEquals when first arg is a string', t => {
		makePipe('potato', () => t.pass('Invokes next')) ('potato')
		const result = makePipe('potato', t.fail) ('cabbage')
		t.false(result)
		t.end()
	})

	t.test('should use textMatches when first arg is a regular expression', t => {
		makePipe(/roll \d+d\d+/, () => t.pass('Invokes next')) ('roll 2d6')
		const result = makePipe(/roll \d+d\d+/, t.fail) ('roll potatoes')
		t.false(result)
		t.end()
	})

	t.test('should move on to next function if it invokes next()', t => {
		makePipe(
			(tx, m, o, next) => {
				t.pass('Invokes first')
				next()
			},
			(tx, m, o, next) => {
				t.pass('Invokes second')
				next()
			},
			(tx, m, o, next) => {
				t.pass('Invokes third')
				next()
			},
			() => t.pass('Invokes last')
		) ()
		t.end()
	})

	t.test('should stop when a function returns false', t => {
		const result = makePipe((t, m, o, next) => next(), (t, m, o, next) => next(), () => false, t.fail) ()
		t.false(result)
		t.end()
	})

	t.test('should throw error if first argument is not string, regEx or function', t => {
		t.throws(makePipe(12, t.fail))
		t.end()
	})

	t.end()
})

// flatten

tap.test('flatten', t => {
	t.test('should return a flattened array', t => {
		t.equal(
			JSON.stringify(flatten([ 1, 2, 3, 4, [ 5, 6 ]])),
			JSON.stringify([ 1, 2, 3, 4, 5, 6 ]),
			'flattens one level'
		)
		t.equal(
			JSON.stringify(flatten([ 1, [ 2, [ 3, 4 ]]])),
			JSON.stringify([ 1, 2, 3, 4 ]),
			'flattens two levels'
		)
		t.equal(
			JSON.stringify(flatten([[ 1, 2 ], [ 3, [ 4, 5 ], [ 6, 7 ]]])),
			JSON.stringify([ 1, 2, 3, 4, 5, 6, 7 ]),
			'flattens when arrays are nested in different indexes'
		)
		t.equal(
			JSON.stringify(flatten([ 1, 2, 3 ])),
			JSON.stringify([ 1, 2, 3 ]),
			'works when there is no flattening needed'
		)
		t.end()
	})

	t.end()
})