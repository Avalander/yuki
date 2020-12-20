const test = require('tape')

const {
  save,
  recall,
  forget,
} = require('commands/persist')


// Mocks

const message = send => ({
	channel: { send },
})

const store = ({ save }) => ({ save })
const withStore = ({ save, load, remove }) => ({
	store: {
		save,
		load,
		remove,
	},
})


// test save

;([
  [ 'store pony: Twilight Sparkle', 'pony', 'Twilight Sparkle' ],
  [ 'store pony : Twilight Sparkle', 'pony', 'Twilight Sparkle' ],
  [ 'store pony:Twilight Sparkle', 'pony', 'Twilight Sparkle' ],
  [ 'store pony :Twilight Sparkle', 'pony', 'Twilight Sparkle' ],
  [ 'store ponies : [ "Twilight Sparkle", "Rainbow Dash" ]', 'ponies', '[ "Twilight Sparkle", "Rainbow Dash" ]' ],
]).forEach(([ cmd, key, value ]) =>
	test(`${cmd} invokes store.save with (${key}, ${value})`, t => {
		t.plan(3)
		save(
			cmd,
			message(text => t.equal(text, 'I will remember that.')),
			withStore({
				save: (k, v) => {
					t.equal(k, key)
					t.equal(v, value)
					return Promise.resolve()
				},
			}))
			.then(() => {
				t.end()
			})
	})
)

test('save logs errors to the console when store.save fails', t => {
	t.plan(1)
	console.error = message => {
		t.equal(message, '¯\\_(ツ)_/¯')
	}
	save(
		'store pony: Twilight Sparkle',
		message(() => {}),
		withStore({
			save: () => Promise.reject('¯\\_(ツ)_/¯'),
		}))
		.catch(() => {
			t.end()
		})
})
