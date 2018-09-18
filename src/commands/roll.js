const { fromNullable } = require('@avalander/fun/src/maybe')

module.exports = (text, message) => {
    if (!text.startsWith('roll ')) return
    let query = text.replace('roll', '').trim()
    let tokens = []
    while (query.length > 0) {
        extractToken(query)
            .fold(
                () => {
                    throw new Error(`Could not parse '${query}'`)
                },
                ([ x, q ]) => {
                    tokens.push(x)
                    query = q
                }
            )

    }
    let result = 0
    while (tokens.length > 0) {
        const partial = evaluateNextToken(result, tokens)
        result = partial[0]
        tokens = partial[1]
    }
    return result
}

const TOKENS = [
    /^fate/,
    /^\d*d\d+/,
    /^(\+|-)/,
    /^\d+/,
]

const extractToken = query =>
    fromNullable(TOKENS.find(t => t.test(query)))
        .map(t => t.exec(query)[0])
        .map(x => [ x, query.substring(x.length) ])

const randInt = (from, to) =>
    Math.floor(Math.random() * (to - from) + from)

const fateDice = () =>
    randInt(-1, 1)

const evalFate = (prev, token, rest) =>
    [
        prev + fateDice() + fateDice() + fateDice() + fateDice(),
        rest,
    ]

const evalDice = (prev, token, rest) => {
    const [n, d] = token.split('d')
    let result = 0
    for (let i = 0; i < n; i++) {
        result += randInt(1, d)
    }
    return [ prev + result, rest ]
}

const evalOperation = (prev, token, [ second, ...tail ]) => {
    const [ next_token, nextEval ] = TOKEN_EVALS.find(([ t ]) => t.test(second))
    const [ nextResult, rest ] = nextEval(0, next_token.exec(second)[0], tail)
    if (token === '+') {
        return [ prev + nextResult, rest ]
    }
    return [ prev - nextResult, rest ]
}

const evalNumber = (prev, token, rest) =>
    [ parseInt(token), rest ]

const TOKEN_EVALS = [
    [ /^fate/, evalFate ],
    [ /^\d*d\d+/, evalDice ],
    [ /^(\+|-)/, evalOperation ],
    [ /^\d+/, evalNumber ],
]

const evaluateNextToken = (prev, [ next, ...rest ]) => {
    const [ re, eval ] = TOKEN_EVALS.find(([ t ]) => t.test(next))
    return eval(prev, next, rest)
}
