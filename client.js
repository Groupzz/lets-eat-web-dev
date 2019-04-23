const http = require('http')
const electron = require('electron')

//Initialize ip address and port
const ip = '104.237.158.50'
const port = 8080

//Registers the user into the database
function register()
{
	console.log("here")
	//Turns the info into a JSON string
	payload = JSON.stringify(info)
	
	//Where we want it to be sent and in what form
	options = {
		host: ip,
		port: port,
		method: 'POST',
		path: '/registerUser',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': Buffer.byteLength(payload)
		}
	}

	//Send the request through http by what we said in the options
	const req = http.request(options,
		(res) => {
			console.log("Sent")
		})

	req.write(payload)
	req.end()
}
