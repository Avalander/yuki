const { makePipe, textMatches } = require('src/commands/util')

const KEY = 'fate'

const regExps = {
    erase: /fate (\w+)?:?\s?erase/i,
    list: /fate list/i,
    gain: /fate (\w+) (?:g|gain):?\s?(\d+)?\D*$/i,
    refresh: /fate (\w+) (?:r|refresh)/i,
    setRefresh: /fate (\w+) (?:sr|set refresh):?\s?(\d+)\D*$/i,
    show: /fate (\w+) (?:sh|show)/i,
    spend: /fate (\w+(?:,\s?\w+)*) (?:sp|spend):?\s?(\d+)?\D*$/i,
}

const makeCharacterList = str => str.split(/,\s?/)

const makePointsMsg = character => `**${character.name}**: ${character.points}`

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

const findCharacter = (name, data) =>
    data.find(x => x.name === name)
    || makeCharacter(name)

const findCharacterOrFail = name =>
    data => {
        const character = data.find(x => x.name === name)
        if (!character) throw { code: 2, message: `${name} not found.`}
        return character
    }

const findCharactersOrFail = names =>
    data =>
        names.map(x => findCharacterOrFail(x)(data))

const makeCharacter = name => ({
    name,
    points: 0,
    refresh: 0,
})

const updateCharacter = (update, character) => ({
    ...character,
    ...update,
})

const refreshFate = name =>
    data => {
        const character = findCharacterOrFail(name)(data)
        const points = Math.max(character.points, character.refresh)
        return data
            .filter(x => x.name !== name)
            .concat(updateCharacter({ points }, character))
    }

const setRefresh = (refresh, name) =>
    data => {
        const character = findCharacter(name, data)
        return data
            .filter(x => x.name !== name)
            .concat(updateCharacter({ refresh: Number(refresh) }, character))
    }

const gainFate = (name, increase = 1) =>
    data => {
        const character = findCharacterOrFail(name)(data)
        return data
            .filter(x => x.name !== name)
            .concat(updateCharacter({ points: character.points + Number(increase) }, character))
    }

const spendFate = (str, decrease = 1) =>
    data => {
        const names = makeCharacterList(str)
        const characters = findCharactersOrFail(names)(data)

        characters.forEach(x => {
            if (x.points - decrease < 0) throw {
                code: 1,
                message: `${x.name} has only ${x.points} points.`,
            }
        })

        return data
            .filter(x => !names.includes(x.name))
            .concat(characters.map(x => updateCharacter({ points: x.points - decrease }, x)))
    }

const eraseAll = store => store.remove(KEY)
    .then(() => 'All data')

const eraseOne = (store, name) => loadOrCreate(store)
    .then(data => data.filter(x => x.name != name))
    .then(save(store))
    .then(() => name)

module.exports.gainFate = makePipe(
    textMatches(regExps.gain),
    (text, message, { store }) => {
        const [ , name, increase ] = text.match(regExps.gainFate)
        return loadOrCreate(store)
            .then(gainFate(name, increase))
            .then(save(store))
            .then(findCharacterOrFail(name))
            .then(data => message.channel.send(`${name}'s fate is now ${data.points}`))
    }
)

module.exports.refreshFate = makePipe(
    textMatches(regExps.refresh),
    (text, message, { store }) => {
        const [ , name ] = text.match(regExps.refresh)
        return loadOrCreate(store)
            .then(refreshFate(name))
            .then(save(store))
            .then(findCharacterOrFail(name))
            .then(data => message.channel.send(`${name} refreshed. Current fate: ${data.points}`))
    }
)
    
module.exports.setRefreshFate = makePipe(
    textMatches(regExps.setRefresh),
    (text, message, { store }) => {
        const [ , name, refresh ] = text.match(regExps.setRefresh)
        return loadOrCreate(store)
            .then(setRefresh(refresh, name))
            .then(save(store))
            .then(() => message.channel.send(`${name}'s refresh set to ${refresh}.`))
    }
)

module.exports.showFate = makePipe(
    textMatches(regExps.show),
    (text, message, { store }) => {
        const [ , name ] = text.match(regExps.show)
        return loadOrCreate(store)
            .then(findCharacterOrFail(name))
            .then(data => message.channel.send(`**${data.name}** F: ${data.points}, R:${data.refresh}`))
    }
)

module.exports.spendFate = makePipe(
    textMatches(regExps.spend),
    (text, message, { store }) => {
        const [ , names, decrease ] = text.match(regExps.spend)
        return loadOrCreate(store)
            .then(spendFate(names, decrease))
            .then(save(store))
            .then(findCharactersOrFail(makeCharacterList(names)))
            .then(data => message.channel.send(`Fate spent. Current status: ${data.map(makePointsMsg).join(', ')}.`))
            .catch(error =>
                error.code == 1
                    ? message.channel.send(error.message)
                    : Promise.reject(error) 
            )
    }
)

module.exports.listFate = makePipe(
    textMatches(regExps.list),
    (_text, message, { store }) => loadOrCreate(store)
        .then(data => data.map(x => x.name))
        .then(data => message.channel.send(`I'm currently keeping track of: ${data.join(', ')}`))

)

module.exports.eraseFate = makePipe(
    textMatches(regExps.erase),
    (text, message, { store }) => {
        const [ , name ] = text.match(regExps.erase)
        const fn = name
            ? eraseOne
            : eraseAll

        return fn(store, name)
            .then(data => message.channel.send(`${data} removed.`))
    }
)
