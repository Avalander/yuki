const { makePipe, textMatches } = require('src/commands/util')

const KEY = 'fate'

const regExps = {
    erase: /fate (\w+(?:,\s?\w+)*)?:?\s?erase/i,
    list: /fate list/i,
    gain: /fate (\w+(?:,\s?\w+)*) (?:g|gain):?\s?(\d+)?\D*$/i,
    refresh: /fate (\w+(?:,\s?\w+)*) (?:r|refresh)/i,
    setRefresh: /fate (\w+(?:,\s?\w+)*) (?:sr|set refresh):?\s?(\d+)\D*$/i,
    show: /fate (\w+) (?:sh|show)/i,
    spend: /fate (\w+(?:,\s?\w+)*) (?:sp|spend):?\s?(\d+)?\D*$/i,
}

const makeCharacterList = str => str.split(/,\s?/)

const makePointsMsg = character => `**${character.name}**: ${character.points}`

const makeRefreshsMsg = character => `**${character.name}**: ${character.refresh}`

const compareCharacters = (a, b) => a.name <= b.name ? -1 : 1

const create = store => store.save(KEY, '[]')
    .then(() => '[]')

const loadOrCreate = store => store.load(KEY)
    .catch(() => create(store))
    .then(JSON.parse)

const save = store =>
    data => {
        const sortedData = data.sort(compareCharacters)
        return store
            .save(KEY, JSON.stringify(sortedData))
            .then(() => sortedData)
    }

const findCharacter = (name, data) =>
    data.find(x => x.name === name)
    || makeCharacter(name)

const findCharacterOrFail = name =>
    data => {
        const character = data.find(x => x.name === name)
        if (!character) throw `${name} not found.`
        return character
    }

const findCharactersOrFail = input =>
    data => {
        const names = Array.isArray(input)
            ? input
            : makeCharacterList(input)

        return names.map(x => findCharacterOrFail(x)(data))
    }

const makeCharacter = name => ({
    name,
    points: 0,
    refresh: 0,
})

const updateCharacter = (update, character) => ({
    ...character,
    ...update,
})

const updatePoints = amount =>
    character =>
        updateCharacter({ points: character.points + Number(amount) }, character)

const updateRefresh = amount =>
    character =>
        updateCharacter({ refresh: Number(amount) }, character)

const refreshPoints = character => {
    const points = Math.max(character.points, character.refresh)
    return updateCharacter({ points }, character)
}

const refreshFate = str =>
    data => {
        const names = makeCharacterList(str)
        const characters = findCharactersOrFail(names)(data)
        return data
            .filter(x => !names.includes(x.name))
            .concat(characters.map(refreshPoints))
    }

const setRefresh = (refresh, str) =>
    data => {
        const names = makeCharacterList(str)
        const characters = names.map(x => findCharacter(x, data))

        return data
            .filter(x => !names.includes(x.name))
            .concat(characters.map(updateRefresh(refresh)))
    }

const gainFate = (str, increase = 1) =>
    data => {
        const names = makeCharacterList(str)
        const characters = findCharactersOrFail(names)(data)
        return data
            .filter(x => !names.includes(x.name))
            .concat(characters.map(updatePoints(increase)))
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
            .concat(characters.map(updatePoints(-decrease)))
    }

const eraseAll = store => store.remove(KEY)
    .then(() => 'All data')

const eraseSome = (store, str) => {
    const names = makeCharacterList(str)
    return loadOrCreate(store)
        .then(data => data.filter(x => !names.includes(x.name)))
        .then(save(store))
        .then(() => str)
}

module.exports.gainFate = makePipe(
    textMatches(regExps.gain),
    (text, message, { store }) => {
        const [ , names, increase ] = text.match(regExps.gain)
        return loadOrCreate(store)
            .then(gainFate(names, increase))
            .then(save(store))
            .then(findCharactersOrFail(names))
            .then(data => message.channel.send(`Fate gained. Current status: ${data.map(makePointsMsg).join(', ')}.`))
    }
)

module.exports.refreshFate = makePipe(
    textMatches(regExps.refresh),
    (text, message, { store }) => {
        const [ , names ] = text.match(regExps.refresh)
        return loadOrCreate(store)
            .then(refreshFate(names))
            .then(save(store))
            .then(findCharactersOrFail(names))
            .then(data => message.channel.send(`Fate refreshed. Current status: ${data.map(makePointsMsg).join(', ')}.`))
    }
)
    
module.exports.setRefreshFate = makePipe(
    textMatches(regExps.setRefresh),
    (text, message, { store }) => {
        const [ , names, refresh ] = text.match(regExps.setRefresh)
        return loadOrCreate(store)
            .then(setRefresh(refresh, names))
            .then(save(store))
            .then(findCharactersOrFail(names))
            .then(data => message.channel.send(`Fate refreshed. Current refresh: ${data.map(makeRefreshsMsg).join(', ')}.`))
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
            .then(findCharactersOrFail(names))
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
        const [ , names ] = text.match(regExps.erase)
        const fn = names
            ? eraseSome
            : eraseAll

        return fn(store, names)
            .then(data => message.channel.send(`${data} removed.`))
    }
)
