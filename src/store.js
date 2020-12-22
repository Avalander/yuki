const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const { mkdirp } = require('./system')

const OPTIONS = {
    encoding: 'utf8',
}


const factory = ({ readFile, writeFile, mkdir, removeFile }) => base_path => channel_id => {
    const directory = path.join(base_path, channel_id)

    const validatePath = value =>
        value.startsWith(directory)
            ? Promise.resolve(value)
            : Promise.reject(new Error(`Invalid path '${value}'`))

    const load = key =>
        validatePath(path.join(directory, key))
            .then(dir => readFile(dir, OPTIONS))

    const save = (key, data) =>
        mkdir(directory)
            .then(() => validatePath(path.join(directory, key)))
            .then(dir => writeFile(dir, data, OPTIONS))

    const append = (key, data) =>
        mkdir(directory)
            .then(() => validatePath(path.join(directory, key)))
            .then(dir => writeFile(dir, data, { mode: 'a', ...OPTIONS }))

    const remove = key =>
        validatePath(path.join(directory, key))
            .then(removeFile)
    
    return {
        append,
        load,
        remove,
        save,
    }
}

module.exports = {
    factory,
    makeStore: factory({
        readFile: promisify(fs.readFile),
        writeFile: promisify(fs.writeFile),
        mkdir: mkdirp,
        removeFile: promisify(fs.unlink),
    }),
}
