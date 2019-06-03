'use strict';

// var domino = require('domino');
// var Element = domino.impl.Element; // etc

// var window = domino.createWindow('<h1>Hello world</h1>', 'http://example.com');
// var document = window.document;

// const puppeteer = require('puppeteer');
// (async () => {
//     const browser = await puppeteer.launch();


//         page = await browser.newPage();
//         await page.goto('http://example.com/some.html', {waitUntil: 'load'});


//     const newPage = await page.evaluate(() => {

//         return  document.getElementById("idexample").innerHTML;

//         });

//      console.log(newPage)

//   })();

// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
// const window = (new JSDOM('', {runScripts: "outside-only"})).window;

// const document = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`).window;

//const ex = require('express');
const yelp = require('yelp-fusion');

// Place holder for Yelp Fusion's API Key. Grab them
// from https://www.yelp.com/developers/v3/manage_app
const apiKey = 'p8eXXM3q_ks6WY_FWc2KhV-EmLhSpbJf0P-SATBhAIM4dNCgsp3sH8ogzJPezOT6LzFQlb_vcFfxziHbHuNt8RwxtWY0-vRpx7C0nPz5apIT4A5LYGmaVfuwPrf3WXYx';

// Wait for submit button to be clicked

document.getElementById('submit').onclick = function() {
	var input = document.getElementById(input).value;  // Get inputs
	//document.getElementById('search').innerHTML = input;
	var location = document.getElementById(location).value;
	yelpSearch(input, location);  // Call yelp query function with inputs as search parameters
};


// Query Yelp API with 'input' as search criteria
function yelpSearch(input, location)
{
	// Change background image so results/text is more readable
	document.body.style.backgroundImage = "url('./images/accmgmt.jpg')";
	// For some reason the yelp result will only be displayed if I change innerHTML first
	document.getElementById('search').innerHTML = "Please Wait...";
	document.getElementById('search').innerHTML = "";


	// Create search query
	const searchRequest = {
	  term: input,
	  location: location
	};

	// Create yelp client to send/recieve API request
	const client = yelp.client(apiKey);

	// Call Yelp API with searchRequest
	// Returns:  Top 20 results
	client.search(searchRequest).then(response => {
		var i;
		// Iterate through 20 results
		for(i in response.jsonBody.businesses)
		{
			// Get JSON data for next restaurant
			const result = response.jsonBody.businesses[i];
			// Iterate through key:value JSON attributes
			for(var key in result)
			{
				// Print key:value line by line
				if(result.hasOwnProperty(key))
				{
					// window.eval('document.getElementById(\'search\').innerHTML += "<strong>" + key + ":</strong>  " + JSON.stringify(result[key], null, 4) + "<br>";');
					document.getElementById('search').innerHTML += "<strong>" + key + ":</strong>  " + JSON.stringify(result[key], null, 4) + "<br>";
				}
			}
			// Line breaks between results
			document.getElementById('search').innerHTML += "<br><br>";
			//document.getElementById('search').innerHTML += jsonResult + "<br> <br>";// + jsonResult;
		}
	}).catch(e => {
	  console.log(e);
	});
}
//}

module.exports.yelpSearch = yelpSearch
