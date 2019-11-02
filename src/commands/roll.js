const { checkRole, makePipe, textContains } = require('./util')

module.exports = makePipe(
    textContains("roll"),
    (text, message) => 
        text.includes("set default roll") 
            ? message.channel.send(setDefaultRoll(text, message))
            : message.channel.send(parseRolls(text))
)

let defaultRoll

const regEx = {
    gModifier: /[+-]\d+(?!d(?:\d+|f))/g,
    gRoll: /[+-](\d+)d(\d+|f)/g,
    roll: /[+-](\d+)d(\d+|f)/,
    tEfs: /^f|[^d]f|\Ddf/g,
    tNoRoll: /\Dd|d[^0-9f]|[a-ceg-z]/g,
    tSplitter: /(?=[^+-]\d+d(?:\d+|f))/,
    tTrimmer: /[^-+0-9df\s]/g
}

const randInt = (from, to) => Math.floor(Math.random() * (to - from + 1)) + from

const roller = (dice, start, end) => Array(parseInt(dice)).fill(1).reduce((a, b) => {
    const roll = randInt(start, end)
    return { result: a.result + roll, rolls: a.rolls.concat(roll) }
}, { result: 0, rolls: [] })
  
const reduceRolls = (a, b) => {
    const exp = b.match(regEx.roll)

    const isFudge = exp[2] == "f" ? true : false
    const roll = isFudge ? roller(exp[1], -1, 1) : roller(exp[1], 1, exp[2])
    const rollArr = isFudge ? a.rolls.concat([roll.rolls.map(x => fudgify(x))]) : a.rolls.concat([roll.rolls])

    return exp[0].startsWith("+") 
        ? { result: a.result + roll.result, rolls: rollArr }
        : { result: a.result - roll.result, rolls: rollArr }
}

const reduceNumber = (a, b) => a + parseInt(b)

const addModifiers = (text, regEx, reducer, initVal) => {
    const mod = text.match(regEx)
    return mod != null ? mod.reduce(reducer, initVal) : 0
}

const addNumbers = text => addModifiers(text, regEx.gModifier, reduceNumber, 0)

const addRolls = text => addModifiers(text, regEx.gRoll, reduceRolls, { result: 0, rolls: [] })

const parseRolls = text => {
    const str = getRollExps(text)
    return str === ""
        ? defaultRoll 
            ? parseRolls(defaultRoll)
            : "Invalid expression"
        : str.split(regEx.tSplitter)
            .map(x => {
                const rolls = addRolls(`+${x.trim()}`)
                return `**${rolls.result + addNumbers(x)}** (${rolls.rolls.join("),(")}) [_${x.split(" ").join("")}_]`
            })
            .reduce((a, b) => `${a}\n${b}`, "There you go:")
}

const fudgify = num => {
    const map = { "-1": "-", "0": " ", "1": "+" }
    return map[num]
}

const getRollExps = text => text.toLowerCase().replace(regEx.tEfs, "").replace(regEx.tNoRoll, "").replace(regEx.tTrimmer, "").trim()

const setDefaultRoll = (text, msg) => {
    if(!checkRole(msg.author.id, msg.guild.roles)) return "Sorry, you don't have permission to do that."
    const str = getRollExps(text).trim()
    if (str === "") return "Invalid expression"
    else {
        defaultRoll = str
        return `I've set default roll to ${defaultRoll}.`
    }
}