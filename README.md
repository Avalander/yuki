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

## Memory Object

The memory object provides a cache shared among all command handlers, but specific to the channel. I.e., the memory object has a cache for each channel, but all command handlers invoked in that channel will receive the same cache. The cache is kept for as long as the bot is running, but it's not persisted between restarts. The cache stores data in key-value format.

- `get(key, defaultValue)`: returns the value associated to the given `key`. If there is no value associated to the given `key`, it is set to `defaultValue` and returned.
- `set(key, value)`: sets the given `value` for the given `key`.

```javascript
const saveMessageHandler = (text, message, { client, settings, memory }) => {
	const messages = memory.get('messages', [])
	messages.push(text)
}

const listMessagesHandler = (text, message, { client, settings, memory }) => {
	const messages = memory.get('messages')
	return message.channel.send(messages)
}
```