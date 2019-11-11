const fs = require('fs')
const { sep, join } = require('path')
const { promisify } = require('util')

const mkdir = promisify(fs.mkdir)

module.exports.mkdirp = path =>
  path.split(sep)
    .reduce((prev, step) => {
      return prev.then(path => {
        const current = join(path, step)
        return fs.existsSync(current)
          ? Promise.resolve(current)
          : mkdir(current).then(() => current)
      })
    }, Promise.resolve('/'))
