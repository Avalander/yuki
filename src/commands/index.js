const remember = require('./remember')

module.exports = [
	require('./status'),
	require('./source'),
	require('./greet'),
	require('./update'),
	require('./version'),
	require('./restart'),
	require('./test'),
	remember.memorise,
	remember.recall,
	remember.forget,
]