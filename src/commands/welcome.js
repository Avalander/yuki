const { makePipe, textContains } = require('./util')
const { randElem } = require('src/randtools')

module.exports = makePipe(
    textContains('thank', 'cheers', 'brilliant', 'you\'re a star', 'you have my gratitude'),
    (text, message) => message.channel.send(randElem(responses))
)

const responses = [
    'You\'re welcome',
    'Anytime!',
    'No problem',
    'Gratitude acknowledged',
    '_nods_',
    '_imperceptible nod_',
    '. . .',
]