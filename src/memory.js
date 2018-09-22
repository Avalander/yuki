const ChannelMemory = () => {
    const caches = {}

    return {
        get: (key, defaultValue={}) => {
            caches[key] = caches[key] || defaultValue
            return caches[key]
        },
        set: (key, value) =>
            caches[key] = value
    }
}

module.exports = () => {
    const caches = {}

    return {
        get: key => {
            caches[key] = caches[key] || ChannelMemory()
            return caches[key]
        }
    }
}