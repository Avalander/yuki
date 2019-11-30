const { checkClearance, makePipe, textContains } = require('./util')
const { randInt } = require('../randtools')

module.exports =
    makePipe(
        textContains('roll'),
        (text, message, { memory }) => 
            text.includes('set default roll')
                ? message.channel.send(setDefaultRoll(text, message, memory))
                : message.channel.send(parseRolls(text, memory))
    )

const regEx = {
    gGeneral: /(?:[+-])?\d+(?:d(?:\d+|f))?/g,
    gModifier: /[+-]\d+(?!d(?:\d+|f))/g,
    gRoll: /[+-](\d+)d(\d+|f)/g,
    roll: /[+-](\d+)d(\d+|f)/,
    tSplitter: /(?=[^+-]\d+d(?:\d+|f))/,
}

const roller = (dice, start, end) => Array(parseInt(dice)).fill(1).reduce((a) => {
    const roll = randInt(start, end)
    return { result: a.result + roll, list: a.list.concat(roll) }
}, { result: 0, list: [] })
  
const reduceRolls = (a, b) => {
    const exp = b.match(regEx.roll)

    const isFudge = exp[2] == 'f' ? true : false
    const roll = isFudge ? roller(exp[1], -1, 1) : roller(exp[1], 1, exp[2])
    const rollArr = isFudge ? a.list.concat([roll.list.map(x => fudgify(x))]) : a.list.concat([roll.list])

    return exp[0].startsWith('+') 
        ? { result: a.result + roll.result, list: rollArr }
        : { result: a.result - roll.result, list: rollArr }
}

const reduceNumber = (a, b) => a + parseInt(b)

const addModifiers = (text, regEx, reducer, initVal) => {
    const mod = text.match(regEx)
    return mod != null ? mod.reduce(reducer, initVal) : 0
}

const addNumbers = text => addModifiers(text, regEx.gModifier, reduceNumber, 0)

const executeRolls = text => addModifiers(text, regEx.gRoll, reduceRolls, { result: 0, list: [] })

const parseRolls = (text, memory) => {
    const exps = getRollExps(text)
    return exps.length >= 1
        ? formatResult(exps)
        : Object.entries(memory.get('defaultRoll')).length > 0
        ? parseRolls(`roll ${memory.get('defaultRoll')}`, memory)
        : 'Invalid expression'
}

const extractExpression = text => {
    const expressions = []
    text.replace(regEx.gGeneral, x => expressions.push(x))
    return expressions.join('')
}

const formatExpression = expression => {
    const rolls = executeRolls(`+${expression}`)
    return `**${rolls.result + addNumbers(expression)}** (${rolls.list.join('),(')}) [_${expression}_]`
}

const formatResult = expressions => expressions
    .map(formatExpression)
    .reduce((a, b) => `${a}\n${b}`, 'There you go:')

const fudgify = num => {
    const map = { "-1": "-", "0": " ", "1": "+" }
    return map[num]
}

const getRollExps = text => text.toLowerCase().split(regEx.tSplitter).slice(1).map(x => extractExpression(x))
    
const setDefaultRoll = (text, message, memory) => checkClearance(message, () => {
    const expression = getRollExps(text).join(', ')
    if (expression === '') return "Invalid expression"
    else {
        memory.set('defaultRoll', expression)
        return `I've set default roll to ${memory.get('defaultRoll')}.`
    }
})

const getHelp = () => `This is the functionality of the module \`roll\`:\n${descriptions.map(x => `\`${x[0]}\`: ${x[1]}\n`)}`

const descriptions = [
    [ "roll", "With this command, I will simulate a dice roll and return a result based on your expression.\nWrite [number]d[number] (v.gr. 2d6) and I will roll the appropriate die. You can also add as many modifiers (either static numbers or rolls) by appending a + or a - in front of them (v.gr. 2d6+3-1d4). You can also chain more than one roll (v.gr. 2d6+3, 2d6+5, 2d6-1d4)." ],
    [ "set default roll", "**Only for GMs**. With this command, I will store your roll expression and use it when someone does not provide a valid roll expression with the command `roll`." ],
]
