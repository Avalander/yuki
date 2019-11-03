module.exports.randElem = array => array[Math.floor(Math.random() * array.length)]

module.exports.randInt  = (from, to) => Math.floor(Math.random() * (to - from + 1)) + from
