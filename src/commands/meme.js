const { get } = require('../request')
const {
	makePipe,
	textContains,
} = require('./util')

const handler = ({ get }) => {
	const fetchMeme = () => get({
		host: 'some-random-api.ml',
		path: '/meme',
		headers: {
			Accept: 'application/json',
		},
	})

	return (_, message) => fetchMeme()
		.then(meme => message.channel.send(`${meme.caption} ${meme.image}`))
		.catch(error => {
			console.error(error)
			message.channel.send('Something went wrong')
		})
}

module.exports = makePipe(
	textContains('meme'),
	handler({ get })
)

module.exports.factory = ({ get }) => makePipe(
	textContains('meme'),
	handler({ get })
)