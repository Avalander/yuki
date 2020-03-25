const persist = require('./persist')
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
	...require('./weather'),
	require('./welcome'),
	persist.save,
	persist.recall,
	persist.forget,
	require('./joke'),
	require('./meme'),
]
