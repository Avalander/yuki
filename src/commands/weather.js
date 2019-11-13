const { checkClearance, evalTextStart, makePipe } = require('./util')
const rnd = require('../randtools')

module.exports = makePipe(
    evalTextStart((text, message, { memory }) => message.channel.send(checkPrecipitation(memory)), 'check precipitation', 'check rain'),
    evalTextStart((text, message, { memory }) => message.channel.send(newPrecipitation(message, memory)), 'new precipitation', 'new rain'),
    evalTextStart((text, message, { memory }) => message.channel.send(setPrecipitation(text, message, memory)), 'set precipitation', 'set rain'),
    evalTextStart((text, message, { memory }) => message.channel.send(checkSeason(memory)), 'check season'),
    evalTextStart((text, message, { memory }) => message.channel.send(newSeason(message, memory)), 'new season'),
    evalTextStart((text, message, { memory }) => message.channel.send(setSeason(text, message, memory)), 'set season'),
    evalTextStart((text, message, { memory }) => message.channel.send(checkTemperature(memory)), 'check temperature'),
    evalTextStart((text, message, { memory }) => message.channel.send(newTemperature(message, memory)), 'new temperature'),
    evalTextStart((text, message, { memory }) => message.channel.send(setTemperature(text, message, memory)), 'set temperature'),
    evalTextStart((text, message, { memory }) => message.channel.send(checkWeather(memory)), 'check weather'),
    evalTextStart((text, message, { memory }) => message.channel.send(newWeather(message, memory)), 'new weather'),
    evalTextStart((text, message, { memory }) => message.channel.send(checkWind(memory)), 'check wind'),
    evalTextStart((text, message, { memory }) => message.channel.send(newWind(message, memory)), 'new wind'),
    evalTextStart((text, message, { memory }) => message.channel.send(setWind(text, message, memory)), 'set wind')
)

//Data
const SEASONS = [{
    name: 'winter',
    precipitation: 30,
    temperature: -1.25,
},{
    name: 'spring',
    precipitation: 70,
    temperature: -0.25,
},{
    name: 'summer',
    precipitation: 15,
    temperature: 0,
},{
    name: 'autumn',
    precipitation: 60,
    temperature: -0.75,
}]

const DESCRIPTIONS = {
    precipitation: [
        'No precipitation',
        'Light fog (Visibility reduced to 3/4; -2 Perception checks and ranged attacks)',
        'Medium fog (Visibility reduced by half; -4 Perception checks and ranged attacks)',
        'Medium precipitation (Visibility reduced by half; -4 Perception checks and ranged attacks; automatically extinguishes unprotected flames (candles, torches, and the like))',
        'Heavy precipitation (Visibility reduced to 1/4; -6 Perception checks and ranged attacks; automatically extinguishes unprotected flames)',
    ],
    temperature: [
        'Below -30ºC (1d6 cold damage every minute (no save); Fort save (DC 15, +1 per previous check) or take 1d4 nonlethal damage)',
        'Below -20ºC (Fort save every 10 min (DC 15, +1 per previous check) or take 1d6 points of nonlethal damage)',
        'Below 5ºC (Fort save each hour (DC 15, +1 per previous check) or take 1d6 points of nonlethal damage)',
        'Chilled',
        'Cool',
        'Warm',
        'Above 30ºC (Fort save each hour (DC 15, +1 per previous check) or take 1d4 points of nonlethal damage)',
        'Above 45ºC (Fort save every 10 min (DC 15, +1 per previous check) or take 1d4 points of nonlethal damage)',
        'Above 60ºC (1d6 fire damage every minute (no save); Fort save every 5 minutes (DC 15, +1 per previous check) or take 1d4 nonlethal damage)',
    ],
    wind: [
        '0-10 mph',
        '11-20 mph',
        '21-30 mph (-2 Fly and Perception checks, and ranged weapon attacks; check size Tiny)',
        '31-50 mph (-4 Fly and Perception checks, and ranged weapon attacks; check size Small; blown away size Tiny)',
        '51-74 mph (-8 Fly and Perception checks; ranged weapon attacks impossible; check size Medium; blown away size Tiny)',
    ],
}

const PRECIPTABLE = [{
    chance: 10,
    severity: 1,
},{
    chance: 30,
    severity: 2,
},{
    chance: 90,
    severity: 3,
},{
    chance: 100,
    severity: 4,
}]

const TEMPTABLE = [{
    chance: 5,
    severity: -1.5,
},{
    chance: 35,
    severity: -0.5,
},{
    chance: 75,
    severity: 0,
},{
    chance: 99,
    severity: 0.5,
},{
    chance: 100,
    severity: 1.5,
}]

const WINDTABLE = [{
    chance: 50,
    severity: 0,
},{
    chance: 80,
    severity: 1,
},{
    chance: 90,
    severity: 2,
},{
    chance: 95,
    severity: 3,
},{
    chance: 100,
    severity: 4,
}]

//Utility functions.
const regEx = {
    firstLetter: /^\w/,
    number: /-?[1-5]/,
    seasons: /spring|winter|summer|autumn/,
}

const doChecks = (message, memory, next) => checkClearance(message, () => checkSeason(memory)
    ? next()
    : 'You need to set a season first.'
)

const rollChance = table => {
    const chance = rnd.randInt(1, 100)
    return table.find(x => chance <= x.chance)
}

//Weather functions.
const checkWeather = memory => `${checkSeason(memory)}\n${checkPrecipitation(memory)}\n${checkTemperature(memory)}\n${checkWind(memory)}`

const newWeather = (message, memory) => 
    doChecks(message, memory, () => {
        newPrecipitation(message, memory)
        newTemperature(message, memory)
        newWind(message, memory)
        return checkWeather(memory)
    })

//Precipitation functions.
const checkPrecipitation = memory => {
    const rain = memory.get('precipitation')
    return `**Precipitation**'s severity is ${rain + 1}: ${DESCRIPTIONS.precipitation[rain]}.`
}

const newPrecipitation = (message, memory) =>
    setPrecipitation(rnd.randInt(1, 100) <= memory.get('season').precipitation
        ? `${rollChance(PRECIPTABLE).severity + 1}`: '1', message, memory
    )

const setPrecipitation = (text, message, memory) => 
    doChecks(message, memory, () => {
        const match = text.match(regEx.number)
        if (match == null || match[0] < 0) return 'Severity must be a number between 1 and 5.'
        memory.set('precipitation', parseInt(match[0]) - 1)
        return checkPrecipitation(memory)
    })

//Temperature functions.
const checkTemperature = memory => {
    const temp = memory.get('temperature')
    return `**Temperature**'s severity is ${Math.abs(temp) + 1} (${temp > 0 ? "Hot" : temp == 0 ? "Cool" : "Cold"}): ${DESCRIPTIONS.temperature[temp + 4]}.`
}

const newTemperature = (message, memory) => {
    const temp = Math.round(memory.get('season').temperature + rollChance(TEMPTABLE).severity)
    return setTemperature(temp < 0 ? `${temp -1}` : `${temp + 1}`, message, memory)
}

const setTemperature = (text, message, memory) =>
    doChecks(message, memory, () => {
        const match = text.match(regEx.number)
        if (match == null) return 'Severity must be a number between (-)1 and (-)5.'
        const severity = parseInt(match[0])
        memory.set('temperature', severity > 0 ? severity - 1 : severity + 1)
        return checkTemperature(memory)
    })

//Wind functions.
const checkWind = memory => {
    const wind = memory.get('wind')
    return `**Wind**'s severity is ${wind + 1}: ${DESCRIPTIONS.wind[wind]}.`
}

const newWind = (message, memory) => setWind(`${rollChance(WINDTABLE).severity + 1}`, message, memory)

const setWind = (text, message, memory) =>
    doChecks(message, memory, () => {
        const match = text.match(regEx.number)
        if (match == null || match[0] < 0) return 'Severity must be a number between 1 and 5.'
        memory.set('wind', parseInt(match[0]) - 1)
        return checkWind(memory)
    })

//Season functions.
const checkSeason = memory => {
    const season = memory.get('season')
    return Object.keys(season).length > 0
        ? `We are in *${season.name.replace(regEx.firstLetter, x => x.toUpperCase())}*`
        : false
}

const newSeason = (message, memory) =>
    checkClearance(message, () => setSeason(rnd.randElem(SEASONS).name, message, memory))

const setSeason = (text, message, memory) =>
    checkClearance(message, () => {
        const newSeason = text.match(regEx.seasons)
        if (newSeason == null) return 'Sorry, I have no data about that season.'
        memory.set('season', SEASONS.find(x => x.name == newSeason[0]))
        return `The season has been set to **${memory.get('season').name}**. This is the current weather.\n${newWeather(message, memory)}`
    })
