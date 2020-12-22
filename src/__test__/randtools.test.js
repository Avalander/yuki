const test = require('tape')

const rnd = require('src/randtools')

//Random integers
test('randInt(-2, 2) returns an integer between -2 and 2', t => {
    t.plan(100)
    for (let i = 0; i < 100; i++) {
      const result = rnd.randInt(-2, 2)
      t.assert(result >= -2 && result <= 2, `Expect ${result} to be between -2 and 2`)
    }
})

test('randInt() returns an integer within a random range', t => {
    t.plan(100)
    for (let i = 0; i < 100; i++) {
        const from = rnd.randInt(-100, 100)
        const to = rnd.randInt(from, 150)
        const result = rnd.randInt(from, to)
        t.assert(result >= from && result <= to, `Expect ${result} to be between ${from} and ${to}`)
    }
})

//Random element in array
test('randElem() returns an element within the array', t => {
    const array = [ "Twilight Sparkle", "Rarity", "Rainbow Dash", "Fluttershy", "Pinkie Pie", "Applejack"]
    t.plan(100)
    for (let i = 0; i < 100; i++) {
        const pony = rnd.randElem(array)
        t.assert(array.includes(pony), `Expect ${pony} to be in the array`)
    }
})
