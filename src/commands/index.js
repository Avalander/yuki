const remember = require('./remember')
const roll = require('./roll')

module.exports = [
	require('./status'),
	require('./source'),
	require('./greet'),
	require('./update'),
	require('./version'),
	require('./restart'),
	remember.memorise,
	remember.recall,
	remember.forget,
	roll.setDefaultRoll,
	roll.checkDefaultRoll,
	roll.rollSomething,
	require('./wildMagic'),
	require('./weather'),
]
