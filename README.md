# Yuki

This is a simple discord bot written with discord.js.

## Command handler

```javascript
const handler = (text, message, { client, settings, memory }) => {
	// Handle command here
}
```

### Arguments

- `text`: a string with the message content, without the mention to the bot.
- `message`: the whole [message object](https://discord.js.org/#/docs/main/stable/class/Message) from discord.js.
- `client`: the whole [client object](https://discord.js.org/#/docs/main/stable/class/Client) from discord.js.
- `settings`: an object containing the following fields:
  - `version`: a string with the bot's current version.
  - `started_on`: a timestamp of when the bot was started in milliseconds.
  - `admins`: a list of discord user ids that are allowed to invoke admin commands.
- `memory`: a [memory object](#memory-object).

## Memory API

The memory API provides a cache shared among all command handlers, but specific to the channel. I.e., the memory object has a cache for each channel, but all command handlers invoked in that channel will receive the same cache. The cache is kept for as long as the bot is running, but it's not persisted between restarts. The cache stores data in key-value format.

- `get(key, defaultValue)`: returns the value associated to the given `key`. If there is no value associated to the given `key`, it is set to `defaultValue` and returned.
- `set(key, value)`: sets the given `value` for the given `key`.

```javascript
const saveMessageHandler = (text, message, { client, settings, memory }) => {
	memory.set('last-message', {
		timestamp: Date.now()
		author: message.author.id,
		text,
	})
}

const listMessagesHandler = (text, message, { client, settings, memory }) => {
	const { author, timestamp } = memory.get('last-message', {})
	return message.channel.send(`Last message was written by ${author} on ${new Date(timestamp)}`)
}
```

## Store API

The store API provides a persistent storage shared among all command handlers, but specific to the channel, in the same way that the memory API works.

- `append(key, data) -> Promise<>`: appends the string `data` to the end of the file identified with `key`. If there is no previous file, a new one is created.
- `load(key) -> Promise<String>`: returns a promise that resolves with the content of the file identified with `key` or rejects if the file doesn't exist.
- `remove(key) -> Promise<>`: removes the file identified with `key`.
- `save(key, data) -> Promise<>`: saves the string `data` in a file identified with `key`. If the file already exists, it is overwritten.

```javascript
const saveHandler = (text, message, { store }) =>
	store.save('best-alicorn', 'Twilight Sparkle')
		.then(() => message.channel.send('Best alicorn saved.'))

const readHandler = (text, message, { store }) =>
	store.load('best-alicorn')
		.then(data => message.channel.send(`Best alicorn is ${data}.`))
		.catch(() => message.channel.send(`I don't know who the best alicorn is.`))

const removeHandler = (text, message, { store }) =>
	store.remove('best-alicorn')
		.then(() => message.channel.send(`I have forgotten who the best alicorn is.`))
```
