module.exports.randElem = array => array[module.exports.randInt(0, array.length - 1)]

module.exports.randInt  = (from, to) => Math.floor(Math.random() * (to - from + 1)) + from
