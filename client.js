const http = require('http')
const electron = require('electron')

const ip = '104.237.158.50'
const port = 8080

function validate(email, password)
{
}

function register(info)
{
	payload = JSON.stringify(info)

	options = {
		host: ip,
		port: port,
		method: 'POST',
		path: '/registerUser',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': Buffer.byteLength(info)
		}
	}

	const req = http.request(options,
		(res) => {
			console.log("Sent")
		})

	req.write(info)
	req.end()
}
