const { checkClearance, makePipe, textContains } = require('./util')
const { randInt } = require('../randtools')

module.exports =
    makePipe(
        textContains('roll'),
        (text, message, { memory }) =>
            text.includes('--help')
                ? message.channel.send(getHelp())
                : text.includes('set default roll')
                ? message.channel.send(setDefaultRoll(text, message, memory))
                : message.channel.send(parseRolls(text, memory))
    )

const FUDGE_MAP = { '-1': '-', '0': ' ', '1': '+' }

const INVALID = 'Invalid expression. Type `roll --help` if you need to know more about this command.'

const regEx = {
    gGeneral: /(?:[+-])?\d+(?:d(?:\d+|f))?/g,
    gModifier: /[+-]\d+(?!d(?:\d+|f))/g,
    gRoll: /[+-](\d+)d(\d+|f)/g,
    roll: /[+-](\d+)d(\d+|f)/,
    tSplitter: /(?=[^+-\d]\d+d(?:\d+|f))/,
}

const roller = (dice, start, end) => Array
    .from({ length: parseInt(dice) }, () => randInt(start, end))
    .reduce((a, b) => ({ result: a.result + b, list: a.list.concat(b) }), { result: 0, list: [] })
  
const reduceRolls = (a, b) => {
    const exp = b.match(regEx.roll)

    const isFudge = exp[2] == 'f' ? true : false
    const roll = isFudge ? roller(exp[1], -1, 1) : roller(exp[1], 1, exp[2])
    const rollArr = isFudge ? a.list.concat([roll.list.map(x => FUDGE_MAP[x])]) : a.list.concat([roll.list])

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
        ? formatResult(memory.get('defaultRoll'))
        : INVALID
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

const getRollExps = text => text.toLowerCase().split(regEx.tSplitter).slice(1).map(x => extractExpression(x))
    
const setDefaultRoll = (text, message, memory) => checkClearance(message, () => {
    const expression = getRollExps(text)
    if (expression.length < 1) return INVALID
    else {
        memory.set('defaultRoll', expression)
        return `I've set default roll to ${memory.get('defaultRoll').join(', ')}.`
    }
})

const getHelp = () => `I will roll dice for you.
${descriptions.map(x => `- \`${x.command}\`: ${x.description}`).join('\n')}`

const descriptions = [
    { 
        command: 'roll',
        description: 'I will simulate a dice roll and return a result based on your expression. You can chain more than one roll.\n\t`[number]d[number](+|-[number])`\n\tExamples: `2d6`, `2d8-1d4+3`, `1d10+3, 2d6-1d4+1d8+5 and 2d10-1d4`',
    },{
        command: 'set default roll',
        description: '**Only for GMs**. I will store your roll expression and use it when someone does not provide a valid expression with `roll`.',
    },
]
