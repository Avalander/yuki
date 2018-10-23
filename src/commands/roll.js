const { checkRole } = require('./util');

const rollRegEx = /(\d+)d(\d+|f)/;

let defaultRoll;

function addModifier(text){
    const regEx = /(\+\d+|\-\d+)/;
    if (regEx.test(text)) return regEx.exec(text);
    else return 0;
}

function numberToFudge(number) {
    if (number > 0) return '+';
    if (number < 0) return '-';
    if (number == 0) return '  ';
}

function roll (text) {
    try {
        const [ _, n, dice ] = text.match(rollRegEx);
        const rolls = new Array;
        let total = 0;
        let modifier =addModifier(text);
        modifier = parseInt(modifier);
        for (let i=n;i>=1;i--) {
            let result;
            if (dice == 'f') {
                result = Math.floor(Math.random() * 3) -1 ;
            }else{
                result = Math.floor(Math.random() * dice) + 1;
            }
            total += result;
            if (dice == 'f') result = numberToFudge(result);
            rolls.push(result);
        }
        total += modifier;
        let result = total;
        if (n > 1) result += ' (' + rolls.join() + ')';
        return result;
    }catch (e) {
        return (defaultRoll 
            ? roll(defaultRoll + text)
            : 'You must set a default roll or give a valid expression.'
        );
    }
}

function checkDefault() {
    return 'Default roll is ' + defaultRoll + '.';
}

function setDefault (newDefault, message) {
    if (checkRole(message.author.id, message.guild.roles)) {
        try {
            const [ roll, n, dice ] = rollRegEx.exec(newDefault);
            defaultRoll = roll;
            return 'Default roll has been set to ' + defaultRoll + '.';
        }catch (e) {
            return 'You must insert a valid expression.';
        }
    }else{
        return 'Sorry, you don\'t have permission to do that.';
    }
}

module.exports.setDefaultRoll = (text, message) => {
    if (text.toLowerCase().startsWith('set default roll')) return message.channel.send(setDefault(text, message));
}

module.exports.checkDefaultRoll = (text, message) => {
    if (text.toLowerCase().startsWith('check default roll')) return message.channel.send(checkDefault());
}

module.exports.rollSomething = (text, message) => {
    if (text.toLowerCase().includes('roll')) return message.channel.send(roll(text));
}
/*
module.exports = (text, message) => {
    text = text.toLowerCase();

    if (text.startsWith('set default roll')) return message.channel.send(setDefault(text, message));
    else if (text.startsWith('check default roll')) return message.channel.send(checkDefault());
    else if (text.includes('roll')) return message.channel.send(roll(text));
}*/
