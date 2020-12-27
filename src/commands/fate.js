const { makePipe, textMatches } = require('src/commands/util')

const KEY = 'fate'

const regExps = {
    getCharacter: /fate (\w+)$/i,
    refresh: /fate (\w+) refresh/i,
    setRefresh: /fate (\w+) set refresh(?::)? (\d+)/i,
}

const create = store => store.save(KEY, '[]')
    .then(() => '[]')

const loadOrCreate = store => store.load(KEY)
    .catch(() => create(store))
    .then(JSON.parse)

const save = store =>
    data =>
        store
            .save(KEY, JSON.stringify(data))
            .then(() => data)

const findCharacter = (character, data) =>
    data.find(x => x.character === character)
    || makeCharacter(character)

const findCharacterOrFail = character =>
    data => {
        const characterObject = data.find(x => x.character === character)
        if (!characterObject) throw new Error('Character not found')
        return characterObject
    }

const makeCharacter = character => ({
    character,
    points: 0,
    refresh: 0,
})

const updateCharacter = (update, character) => ({
    ...character,
    ...update,
})

const refreshFate = (character) =>
    data => {
        const characterObject = findCharacterOrFail(character)(data)
        const points = Math.max(characterObject.points, characterObject.refresh)
        return data
            .filter(x => x.character !== character)
            .concat(updateCharacter({ points }, characterObject))
    }

const setRefresh = (refresh, character) =>
    data => {
        const characterObject = findCharacter(character, data)
        const updatedRefresh = refresh
        return data
            .filter(x => x.character !== character)
            .concat(updateCharacter({ refresh: updatedRefresh }, characterObject))
    }

module.exports.getCharacter = makePipe(
    textMatches(regExps.getCharacter),
    (text, message, { store }) => {
        const [ , character ] = text.match(regExps.getCharacter)
        return loadOrCreate(store)
            .then(findCharacterOrFail(character))
            .then(data => message.channel.send(`**${data.character}** F: ${data.points}, R:${data.refresh}`))
    }
)

module.exports.refresh = makePipe(
    textMatches(regExps.refresh),
    (text, message, { store }) => {
        const [ , character ] = text.match(regExps.refresh)
        return loadOrCreate(store)
            .then(refreshFate(character))
            .then(save(store))
            .then(findCharacterOrFail(character))
            .then(data => message.channel.send(`${character} refreshed. Current fate: ${data.points}`))
    }
)

module.exports.setRefresh = makePipe(
    textMatches(regExps.setRefresh),
    (text, message, { store }) => {
        const [ , character, refresh ] = text.match(regExps.setRefresh)
        return loadOrCreate(store)
            .then(setRefresh(refresh, character))
            .then(save(store))
            .then(() => message.channel.send(`${character}'s refresh set to ${refresh}.`))
    }
)

module.exports.list = makePipe(
    textMatches(/fate list/),
    (text, message, { store }) => store.load(KEY)
        .then(data => message.channel.send(`Here: ${data}`))
)
