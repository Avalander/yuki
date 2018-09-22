const remember = require('./remember')

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
	require('./roll'),
	require('./wildMagic'),
	require('./weather'),
]
