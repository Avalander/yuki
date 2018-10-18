const SEASONS = [{
    name: 'winter',
    precipitation: 30,
    temperature: -1.25
},{
    name: 'spring',
    precipitation: 70,
    temperature: -0.25
},{
    name: 'summer',
    precipitation: 15,
    temperature: 0
},{
    name: 'autumn',
    precipitation: 60,
    temperature: -0.75
}
];

const PRECIPTABLE = [{
    minChance: 0,
    maxChance: 9,
    severity: 1
},{
    minChance: 10,
    maxChance: 29,
    severity: 2
},{
    minChance: 30,
    maxChance: 89,
    severity: 3
},{
    minChance: 90,
    maxChance: 99,
    severity: 4
}]

const PRECIPDESC =[
    'No precipitation',
    'Light fog (Visibility reduced to 3/4; -2 Perception checks and ranged attacks)',
    'Medium fog (Visibility reduced by half; -4 Perception checks and ranged attacks)',
    'Medium precipitation (Visibility reduced by half; -4 Perception checks and ranged attacks; automatically extinguishes unprotected flames (candles, torches, and the like))',
    'Heavy precipitation (Visibility reduced to 1/4; -6 Perception checks and ranged attacks; automatically extinguishes unprotected flames)'
];

const TEMPTABLE = [{
    minChance: 0,
    maxChance: 4,
    variation: -1.5
},{
    minChance: 5,
    maxChance: 34,
    variation: -0.5
},{
    minChance: 35,
    maxChance: 74,
    variation: 0
},{
    minChance: 75,
    maxChance: 98,
    variation: 0.5
},{
    minChance: 99,
    maxChance: 99,
    variation: 1.5
}];

const TEMPDESC = [
    'Below -30ºC (1d6 cold damage every minute (no save); Fort save (DC 15, +1 per previous check) or take 1d4 nonlethal damage)',
    'Below -20ºC (Fort save every 10 min (DC 15, +1 per previous check) or take 1d6 points of nonlethal damage)',
    'Below 5ºC (Fort save each hour (DC 15, +1 per previous check) or take 1d6 points of nonlethal damage)',
    'Chilled',
    'Cool',
    'Warm',
    'Above 30ºC (Fort save each hour (DC 15, +1 per previous check) or take 1d4 points of nonlethal damage)',
    'Above 45ºC (Fort save every 10 min (DC 15, +1 per previous check) or take 1d4 points of nonlethal damage)',
    'Above 60ºC (1d6 fire damage every minute (no save); Fort save every 5 minutes (DC 15, +1 per previous check) or take 1d4 nonlethal damage)'
];

const WINDTABLE = [{
    minChance: 0,
    maxChance: 49,
    severity: 0
},{
    minChance: 50,
    maxChance: 79,
    severity: 1
},{
    minChance: 80,
    maxChance: 89,
    severity: 2
},{
    minChance: 90,
    maxChance: 94,
    severity: 3
},{
    minChance: 95,
    maxChance: 99,
    severity: 4
}];

const WINDDESC = [
    '0-10 mph',
    '11-20 mph',
    '21-30 mph (-2 Fly and Perception checks, and ranged weapon attacks; check size Tiny)',
    '31-50 mph (-4 Fly and Perception checks, and ranged weapon attacks; check size Small; blown away size Tiny)',
    '51-74 mph (-8 Fly and Perception checks; ranged weapon attacks impossible; check size Medium; blown away size Tiny)'
];

const { checkRole } = require('./util');

let currentSeason;
let precipitation;
let temperature;
let wind;

//Utility functions.
function findDesc (element) {
    let table;
    let desc;
    switch (element) {
        case 'precipitation':
            table = PRECIPDESC;
            desc = precipitation;
            break;
        case 'temperature':
            table = TEMPDESC;
            desc = temperature + 4;
            break;
        case 'wind':
            table = WINDDESC;
            desc = wind;
            break;
    }
    return table[desc];
}

function rollChance(table) {
    let diceRoll = rollD100();
    for (let i=0;i<table.length;i++){
        if (diceRoll >= table[i].minChance && diceRoll <= table[i].maxChance) {
            return table[i].severity;
        }
    }
}

function rollD100() {
    return Math.floor(Math.random() * 100);
}

//Forecast functions.
function checkForecast() {
    let curP, curT, curW;
    curP = checkPrecipitation();
    curT = checkTemperature();
    curW = checkWind();
    return '*' + currentSeason.name + '*\n' + curP + '\n' + curT + '\n' + curW;
}

function newForecast(message) {
    if (!checkRole(message.author.id, message.guild.roles)) return 'Sorry, you don\'t have permission to do that.';
    else {
        if (!checkSeason()) return 'You need to set a season first.';
        else{
            newPrecipitation(message);
            newTemperature(message);
            newWind(message);
            return checkForecast();
        }
    }
}

//Precipitation functions.
function checkPrecipitation() {
    return '**Precipitation**\'s severity is ' + (precipitation + 1) + ': ' + findDesc('precipitation');
}

function newPrecipitation(message) {
    if (!checkRole(message.author.id, message.guild.roles)) return 'Sorry, you don\'t have permission to do that.';
    else {
        if (!checkSeason()) return 'You need to set a season first.';
        else{
            let isRaining = rollD100();
            if (isRaining < currentSeason.precipitation) precipitation = rollChance(PRECIPTABLE);
            else precipitation = 0;
            return checkPrecipitation();
        }
    }
}

//Temperature functions.
function checkTemperature() {
    let retT = Math.abs(temperature) + 1;
    if (temperature == 0) retT += ' (Cold/Hot)';
    if (temperature < 0) retT += ' (Cold)';
    if (temperature > 0) retT += ' (Hot)';
    return '**Temperature**\'s severity is ' + retT + ': ' + findDesc('temperature');
}

function newTemperature(message) {
    if (!checkRole(message.author.id, message.guild.roles)) return 'Sorry, you don\'t have permission to do that.';
    else {
        if (!checkSeason()) return 'You need to set a season first.';
        else{
            let tempVar = rollD100();
            for (let i=0;i<TEMPTABLE.length;i++){
                if (tempVar >= TEMPTABLE[i].minChance && tempVar <= TEMPTABLE[i].maxChance) {
                    temperature = Math.round(currentSeason.temperature + TEMPTABLE[i].variation);
                    break;
                }
            }
            return checkTemperature();
        }
    }
}

//Wind functions.
function checkWind() {
    return '**Wind**\'s severity is ' + (wind + 1) + ': ' + findDesc('wind');
}

function newWind(message) {
    if (!checkRole(message.author.id, message.guild.roles)) return 'Sorry, you don\'t have permission to do that.';
    else {
        if (!checkSeason()) return 'You need to set a season first.';
        else{
            wind = rollChance(WINDTABLE);
            return checkWind();
        }
    }
}

//Weather functions.
function setWeather(weather, text, message) {
    if (!checkRole(message.author.id, message.guild.roles)) return 'Sorry, you don\'t have permission to do that.';
    else {
        let severity = text.match(/-?\d+/);
        let absSeverity = Math.abs(severity);
        if (absSeverity >= 1 && absSeverity <= 5) {
            switch (weather) {
                case 'precipitation':
                    precipitation = --severity;
                    return checkPrecipitation();
                    break;
                case 'temperature':
                    if (severity > 0) temperature = --severity;
                    if (severity < 0) temperature = ++severity;
                    return checkTemperature();
                    break;
                case 'wind':
                    wind = --severity;
                    return checkWind();
                    break;
            }
        }else{
            return 'Severity must be a number between 1 and 5 (or -1 and -5 for cold temperatures).';
        }
    }
}

//Season functions.
function checkSeason() {
    if (currentSeason == undefined) return false;
    else return currentSeason.name;
}

function newSeason(message) {
    if (!checkRole(message.author.id, message.guild.roles)) return 'Sorry, you don\'t have permission to do that.';
    else {
        let newSeason = Math.floor(Math.random() * SEASONS.length);
        return setSeason(SEASONS[newSeason].name, message);
    }
}

function setSeason(newSeason, message){
    if (!checkRole(message.author.id, message.guild.roles)) return 'Sorry, you don\'t have permission to do that.';
    else {
        for (let i=0;i<SEASONS.length;i++){
            if (SEASONS[i].name == newSeason){
                currentSeason = SEASONS[i];
                return 'The season has been set to ' + currentSeason.name + '. This is the current forecast.\n' + newForecast(message);
            }
        }
    }
}

module.exports = (text, message) => {
    text = text.toLowerCase();

    if (text.startsWith('new forecast')) return message.channel.send(newForecast(message));
    if (text.startsWith('check forecast')) return message.channel.send(checkForecast());

    if (text.startsWith('set precipitation')) return message.channel.send(setWeather('precipitation', text, message));
    if (text.startsWith('set temperature')) return message.channel.send(setWeather('temperature', text, message));
    if (text.startsWith('set wind')) return message.channel.send(setWeather('wind', text, message));

    if (text.startsWith('check precipitation')) return message.channel.send(checkPrecipitation());
    if (text.startsWith('check temperature')) return message.channel.send(checkTemperature());
    if (text.startsWith('check wind')) return message.channel.send(checkWind());

    if (text.startsWith('new precipitation')) return message.channel.send(newPrecipitation(message));
    if (text.startsWith('new temperature')) return message.channel.send(newTemperature(message));
    if (text.startsWith('new wind')) return message.channel.send(newWind(message));

    if (text.startsWith('set season')) {
        let season = text.match(/winter|spring|summer|autumn/);
        if (season == null) {
            return message.channel.send('Sorry, I don\'t know that season.');
        }else{
            return message.channel.send(setSeason(season, message));
        }
    }
    if (text.startsWith('check season')) return message.channel.send('The current season is ' + checkSeason() + '.');
    if (text.startsWith('new season')) return message.channel.send(newSeason(message));
}