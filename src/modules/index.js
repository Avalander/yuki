const joke = require('./joke')

const modules = [
	joke,
]


module.exports = options =>
	Promise.all(modules.map(initModule(options)))
		.then(mapModules)

const initModule = options => module =>
	module(options)
		.catch(error => {
			console.error(`Failed to initialize module ${module.name}`)
			console.error(error)
			return Promise.resolve({
				commands: [],
				shutdown: () => {},
			})
		})

const mapModules = modules =>
	modules.reduce(
		(prev, { commands, shutdown }) => ({
			commands: prev.commands.concat(commands),
			shutdown: prev.shutdown.concat(shutdown),
		}),
		{ commands: [], shutdown: [] }
	)