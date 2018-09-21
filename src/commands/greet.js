const { makePipe, textEquals } = require('./util')


const MORNING = 'おはよう'
const AFTERNOON = 'こんにちは'
const EVENING = 'こんばんは'


module.exports = makePipe(
    textEquals('hi', 'hello'),
    (text, message) =>
        message.channel.send(
            chooseGreeting(new Date().getHours())
        )
)

const chooseGreeting = time =>
    (time >= 5 && time < 12
        ? MORNING
        : time >= 12 && time < 19
        ? AFTERNOON
        : EVENING
    )
