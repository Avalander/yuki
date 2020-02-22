const https = require('https')

const request = options =>
	new Promise((resolve, reject) => {
		const req = https.request(options, res => {
			const data = []
			res.on('data', chunk => data.push(chunk))
			res.on('end', () => resolve({
				statusCode: res.statusCode,
				body: data.join(''),
				headers: res.headers,
			}))
		})
		req.on('error', reject)
		if (options.body) {
			req.write(typeof options.body === 'string'
				? options.body
				: JSON.stringify(options.body)
			)
		}
		req.end()
	})

module.exports.get = options =>
	request({
		method: 'GET',
		...options,
	})
	.then(({ statusCode, body }) =>
		statusCode >= 200 && statusCode < 300
			? Promise.resolve(JSON.parse(body))
			: Promise.reject({ statusCode, body })
	)
