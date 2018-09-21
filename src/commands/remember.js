const { makePipe, textMatches } = require('./util')


module.exports.memorise = makePipe(textMatches(/remember (\w+):(.+)/))
    .export(
        (text, message, { memory }) => {
            const [ key, value ] = text.replace('remember', '').split(':')
            memory.get('remember')[key.trim()] = value.trim()
            return message.channel.send('I will remember that.')
        }
    )

module.exports.recall = makePipe(textMatches(/recall (.+)/))
    .export(
        (text, message, { memory }) => {
            const key = text.replace('recall', '').trim()
            const value = memory.get('remember')[key]
            return message.channel.send(value
                ? value
                : 'I have no recollection of that.'
            )
        }
    )

module.exports.forget = makePipe(textMatches(/forget (\w+)/))
    .export(
        (text, message, { memory }) => {
            const key = text.replace('forget', '').trim()
            const value = memory.get('remember')[key]
            delete memory.get('remember')[key]
            return message.channel.send(value
                ? `Memory of ${key} has been erased.`
                : `There was no entry about ${key}.`
            )
        }
    )