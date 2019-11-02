const { makePipe, textContains } = require('./util')

module.exports = makePipe(
    textContains('thank', 'cheers', 'brilliant', 'you\'re a star'),
    (text, message) => message.channel.send(chooseResponse())
)

const chooseResponse = () => responses[Math.floor(Math.random() * responses.length)]

const responses = [
    'You\'re welcome',
    'Anytime!',
    'No problem',
    'Gratitude acknowledged',
    '_nods_',
]