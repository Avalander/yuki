const { makePipe, textMatches } = require('./util')

module.exports.save = makePipe(
    textMatches(/store (\w+)\s?:(.+)/i),
    (text, message, { store }) => {
        const [ key, value ] = text.replace(/store/i, '')
            .split(':')
            .map(x => x.trim())
        return store.save(key, value)
            .then(() => message.channel.send('I will remember that.'))
            .catch(console.error)
    }
)

module.exports.recall = makePipe(
    textMatches(/read (.+)/i),
    (text, message, { store }) => {
        const key = text.replace(/read/i, '').trim()
        return store.load(key)
            .then(value => value != null
                ? message.channel.send(value)
                : Promise.reject(`Value for ${key} not found.`)
            )
            .catch(error => {
                console.error(error)
                return message.channel.send('I have no recollection of that.')
            })
    }
)

module.exports.forget = makePipe(
    textMatches(/remove (\w+)/i),
    (text, message, { store }) => {
        const key = text.replace(/remove/i, '').trim()
        return store.remove(key)
            .then(() => message.channel.send(`Memory of ${key} has been erased.`))
            .catch(error => {
                console.error(error)
                return message.channel.send(`I could not delete the specified data.`)
            })
    }
)
